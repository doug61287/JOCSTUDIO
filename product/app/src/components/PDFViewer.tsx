import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useProjectStore } from '../stores/projectStore';
import { MeasurementCanvas } from './MeasurementCanvas';

// Set worker path - using unpkg, version must match installed pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

export function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { project, zoom } = useProjectStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!project?.pdfUrl || !canvasRef.current) return;

    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(project.pdfUrl).promise;
        setNumPages(pdf.numPages);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: zoom * 1.5 });
        
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
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [project?.pdfUrl, zoom, pageNum]);

  return (
    <div ref={containerRef} className="h-full overflow-auto bg-gray-900/50 p-4">
      <div className="pdf-container inline-block relative">
        <canvas ref={canvasRef} className="pdf-canvas" />
        <MeasurementCanvas width={dimensions.width} height={dimensions.height} />
      </div>
      
      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 rounded-lg px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => setPageNum(Math.max(1, pageNum - 1))}
            disabled={pageNum <= 1}
            className="btn btn-secondary text-sm"
          >
            ← Prev
          </button>
          <span className="text-sm">
            Page {pageNum} of {numPages}
          </span>
          <button
            onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
            disabled={pageNum >= numPages}
            className="btn btn-secondary text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
