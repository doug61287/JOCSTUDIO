import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useProjectStore } from '../stores/projectStore';
import { MeasurementCanvas } from './MeasurementCanvas';

// Set worker path - using unpkg, version must match installed pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface PageThumbnail {
  pageNum: number;
  dataUrl: string;
}

export function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { project, zoom, setZoom } = useProjectStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [showNav, setShowNav] = useState(true);
  const [initialFitDone, setInitialFitDone] = useState(false);

  // Load PDF document
  useEffect(() => {
    if (!project?.pdfUrl) return;

    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(project.pdfUrl).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setInitialFitDone(false);
        
        // Generate thumbnails for navigation
        const thumbs: PageThumbnail[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) { // Limit to 50 pages for performance
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.15 });
          
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
  }, [project?.pdfUrl]);

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

  return (
    <div ref={containerRef} className="h-full flex bg-gray-900 overflow-hidden">
      {/* Left Navigation Pane - Bluebeam style */}
      {numPages > 0 && (
        <div 
          className={`${showNav ? 'w-48' : 'w-0'} transition-all duration-200 flex-shrink-0 border-r border-white/10 bg-gray-900/80 overflow-hidden`}
        >
          {showNav && (
            <div className="h-full flex flex-col">
              {/* Nav Header */}
              <div className="p-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">Pages ({numPages})</span>
                <button
                  onClick={() => setShowNav(false)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/50 text-xs"
                  title="Hide navigation"
                >
                  ✕
                </button>
              </div>
              
              {/* Thumbnail List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {thumbnails.map((thumb) => (
                  <button
                    key={thumb.pageNum}
                    onClick={() => handlePageClick(thumb.pageNum)}
                    className={`w-full rounded-lg overflow-hidden border-2 transition-all hover:border-blue-400 ${
                      pageNum === thumb.pageNum 
                        ? 'border-blue-500 ring-2 ring-blue-500/30' 
                        : 'border-white/20'
                    }`}
                  >
                    <img 
                      src={thumb.dataUrl} 
                      alt={`Page ${thumb.pageNum}`}
                      className="w-full"
                    />
                    <div className={`text-xs py-1 text-center ${
                      pageNum === thumb.pageNum ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white/60'
                    }`}>
                      {thumb.pageNum}
                    </div>
                  </button>
                ))}
                
                {numPages > 50 && (
                  <div className="text-xs text-white/40 text-center py-2">
                    +{numPages - 50} more pages
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Nav Button (when hidden) */}
      {!showNav && numPages > 1 && (
        <button
          onClick={() => setShowNav(true)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-gray-800/90 hover:bg-gray-700 rounded-r-lg flex items-center justify-center text-white/60 hover:text-white border border-white/10 border-l-0"
          title="Show page navigation"
        >
          <span className="text-lg">📄</span>
        </button>
      )}

      {/* Main PDF Viewer */}
      <div 
        ref={viewerRef} 
        className="flex-1 overflow-auto p-6 bg-gray-900"
      >
        <div className="min-h-full flex items-start justify-center">
          <div className="pdf-container inline-block relative shadow-2xl overflow-hidden rounded-lg bg-white">
            <canvas ref={canvasRef} className="pdf-canvas block" />
            {dimensions.width > 0 && dimensions.height > 0 && (
              <MeasurementCanvas width={dimensions.width} height={dimensions.height} />
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Page Navigation */}
      {numPages > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-4 border border-white/10 shadow-xl">
          <button
            onClick={() => setPageNum(Math.max(1, pageNum - 1))}
            disabled={pageNum <= 1}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNum}
              onChange={(e) => setPageNum(Math.min(numPages, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-12 px-2 py-1 bg-white/10 rounded text-center text-sm"
            />
            <span className="text-sm text-white/60">of {numPages}</span>
          </div>
          <button
            onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
            disabled={pageNum >= numPages}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
