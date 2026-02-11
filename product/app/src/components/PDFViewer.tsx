import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useProjectStore } from '../stores/projectStore';
import { MeasurementCanvas } from './MeasurementCanvas';
import { BottomToolbar } from './BottomToolbar';

// Set worker path - using unpkg, version must match installed pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface PageThumbnail {
  pageNum: number;
  dataUrl: string;
}

type ThumbnailSize = 'small' | 'medium' | 'large';

const THUMB_SCALES: Record<ThumbnailSize, number> = {
  small: 0.1,
  medium: 0.15,
  large: 0.22,
};

const NAV_WIDTHS: Record<ThumbnailSize, number> = {
  small: 140,
  medium: 180,
  large: 240,
};

export function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { project, zoom, setZoom, activeTool } = useProjectStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [showNav, setShowNav] = useState(true);
  const [initialFitDone, setInitialFitDone] = useState(false);
  const [thumbSize, setThumbSize] = useState<ThumbnailSize>('medium');
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Load PDF document
  useEffect(() => {
    if (!project?.pdfUrl) return;

    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(project.pdfUrl).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setInitialFitDone(false);
        
        // Get first page size for info display
        const firstPage = await pdf.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        setPageSize({ width: baseViewport.width, height: baseViewport.height });
        
        // Generate thumbnails for navigation
        const thumbs: PageThumbnail[] = [];
        const thumbScale = THUMB_SCALES[thumbSize];
        for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) { // Limit to 100 pages for performance
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: thumbScale });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;
          
          thumbs.push({
            pageNum: i,
            dataUrl: canvas.toDataURL('image/jpeg', 0.7),
          });
        }
        setThumbnails(thumbs);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [project?.pdfUrl, thumbSize]);

  // Render current page with fit-to-container on first load
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !viewerRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        
        // Calculate fit-to-container zoom on initial load
        let effectiveZoom = zoom;
        if (!initialFitDone && viewerRef.current) {
          const containerWidth = viewerRef.current.clientWidth - 48; // padding
          const containerHeight = viewerRef.current.clientHeight - 48;
          const baseViewport = page.getViewport({ scale: 1 });
          
          // Calculate scale needed to fit page in container
          const scaleX = containerWidth / baseViewport.width;
          const scaleY = containerHeight / baseViewport.height;
          // Use the smaller scale to ensure the whole page fits
          const fitScale = Math.min(scaleX, scaleY);
          
          effectiveZoom = fitScale;
          setZoom(fitScale);
          setInitialFitDone(true);
        }
        
        // Render at the zoom level (zoom = 1 means 100% of PDF's natural size)
        const viewport = page.getViewport({ scale: effectiveZoom });
        
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        setDimensions({ width: viewport.width, height: viewport.height });
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdfDoc, zoom, pageNum, initialFitDone, setZoom]);

  // Center scroll position after render
  useEffect(() => {
    if (dimensions.width > 0 && viewerRef.current && initialFitDone) {
      const viewer = viewerRef.current;
      // Center horizontally
      viewer.scrollLeft = (viewer.scrollWidth - viewer.clientWidth) / 2;
      // Start near top
      viewer.scrollTop = 0;
    }
  }, [dimensions, initialFitDone]);

  const handlePageClick = useCallback((page: number) => {
    setPageNum(page);
  }, []);

  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !viewerRef.current) return;
    const page = await pdfDoc.getPage(pageNum);
    const containerWidth = viewerRef.current.clientWidth - 48;
    const baseViewport = page.getViewport({ scale: 1 });
    const fitScale = containerWidth / baseViewport.width;
    setZoom(fitScale);
  }, [pdfDoc, pageNum, setZoom]);

  const handleFitToPage = useCallback(async () => {
    if (!pdfDoc || !viewerRef.current) return;
    const page = await pdfDoc.getPage(pageNum);
    const containerWidth = viewerRef.current.clientWidth - 48;
    const containerHeight = viewerRef.current.clientHeight - 48;
    const baseViewport = page.getViewport({ scale: 1 });
    const scaleX = containerWidth / baseViewport.width;
    const scaleY = containerHeight / baseViewport.height;
    const fitScale = Math.min(scaleX, scaleY);
    setZoom(fitScale);
  }, [pdfDoc, pageNum, setZoom]);

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'pan' || !viewerRef.current) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewerRef.current.scrollLeft,
      scrollTop: viewerRef.current.scrollTop,
    });
  }, [activeTool]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart || !viewerRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    viewerRef.current.scrollLeft = panStart.scrollLeft - dx;
    viewerRef.current.scrollTop = panStart.scrollTop - dy;
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // Ctrl + Mouse Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.min(5, Math.max(0.1, zoom + delta)));
    }
  }, [zoom, setZoom]);

  const cycleThumbnailSize = () => {
    const sizes: ThumbnailSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(thumbSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setThumbSize(sizes[nextIndex]);
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Pane - Bluebeam style */}
        {numPages > 0 && (
          <div 
            className={`${showNav ? `w-[${NAV_WIDTHS[thumbSize]}px]` : 'w-0'} transition-all duration-200 flex-shrink-0 border-r border-[#3f3f46] bg-[#252526] overflow-hidden`}
            style={{ width: showNav ? NAV_WIDTHS[thumbSize] : 0 }}
          >
            {showNav && (
              <div className="h-full flex flex-col">
                {/* Nav Header */}
                <div className="p-2 border-b border-[#3f3f46] flex items-center justify-between bg-[#2d2d30]">
                  <span className="text-xs font-medium text-white/70">Pages</span>
                  <div className="flex items-center gap-1">
                    {/* Thumbnail Size Toggle */}
                    <button
                      onClick={cycleThumbnailSize}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/50 text-xs"
                      title={`Thumbnail size: ${thumbSize}`}
                    >
                      {thumbSize === 'small' ? '▫' : thumbSize === 'medium' ? '◻' : '⬜'}
                    </button>
                    <button
                      onClick={() => setShowNav(false)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/50 text-xs"
                      title="Hide navigation"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Thumbnail List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {thumbnails.map((thumb) => (
                    <button
                      key={thumb.pageNum}
                      onClick={() => handlePageClick(thumb.pageNum)}
                      className={`w-full rounded overflow-hidden border-2 transition-all hover:border-blue-400 ${
                        pageNum === thumb.pageNum 
                          ? 'border-blue-500 ring-2 ring-blue-500/30' 
                          : 'border-[#3f3f46]'
                      }`}
                    >
                      <img 
                        src={thumb.dataUrl} 
                        alt={`Page ${thumb.pageNum}`}
                        className="w-full bg-white"
                      />
                      <div className={`text-xs py-1 text-center ${
                        pageNum === thumb.pageNum ? 'bg-blue-600 text-white' : 'bg-[#2d2d30] text-white/60'
                      }`}>
                        <div>{thumb.pageNum}</div>
                        <div className="text-[10px] text-white/40">Scale Not Set</div>
                      </div>
                    </button>
                  ))}
                  
                  {numPages > 100 && (
                    <div className="text-xs text-white/40 text-center py-2">
                      +{numPages - 100} more pages
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Nav Button (when hidden) */}
        {!showNav && numPages > 0 && (
          <button
            onClick={() => setShowNav(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-20 bg-[#2d2d30] hover:bg-[#3f3f46] flex items-center justify-center text-white/60 hover:text-white border-r border-[#3f3f46] rounded-r"
            title="Show page navigation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Main PDF Viewer */}
        <div 
          ref={viewerRef} 
          className="flex-1 overflow-auto p-6 bg-[#1e1e1e]"
          style={{ cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          onWheel={handleWheel}
        >
          <div className="min-h-full flex items-start justify-center">
            <div className="pdf-container inline-block relative shadow-2xl overflow-hidden bg-white">
              <canvas ref={canvasRef} className="pdf-canvas block" />
              {dimensions.width > 0 && dimensions.height > 0 && (
                <MeasurementCanvas width={dimensions.width} height={dimensions.height} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Toolbar - Bluebeam style */}
      <BottomToolbar
        pageNum={pageNum}
        numPages={numPages}
        onPageChange={setPageNum}
        onFitToWidth={handleFitToWidth}
        onFitToPage={handleFitToPage}
        pageSize={pageSize ?? undefined}
      />
    </div>
  );
}
