import { Router, Request, Response } from 'express'
import multer from 'multer'
import { processPDF } from '../services/pdfProcessor.js'
import { analyzeDrawingSet, type SheetAnalysis } from '../services/visionAnalyzer.js'
import { getOrCreateBrain, addTextDocument, addDrawingAnalysis } from '../services/projectBrain.js'
import { pdfToImages } from '../lib/pdfToImage.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

/**
 * POST /documents/upload
 * 
 * Upload a document to a project's brain
 * 
 * Query params:
 * - projectId: Project identifier
 * - projectName: Project name (for new projects)
 * - type: 'specification' | 'drawing' | 'addendum' | 'contract'
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { projectId, projectName, type } = req.query as {
      projectId?: string
      projectName?: string
      type?: string
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const docType = (type || 'general') as 'specification' | 'drawing' | 'addendum' | 'contract' | 'general'
    const pid = projectId || uuidv4()
    const pname = projectName || 'Unnamed Project'
    
    // Initialize brain
    getOrCreateBrain(pid, pname)
    
    const documentId = uuidv4()
    const fileName = req.file.originalname

    // Different processing based on document type
    if (docType === 'drawing') {
      // Vision analysis for drawings
      console.log(`Processing drawing set: ${fileName}`)
      
      // Convert PDF pages to images
      const pages = await pdfToImages(req.file.buffer)
      console.log(`Converted ${pages.length} pages to images`)
      
      // Analyze each page with vision
      const analyses = await analyzeDrawingSet(
        pages.map((p, i) => ({
          pageNumber: i + 1,
          imageBase64: p.base64,
          mimeType: p.mimeType
        })),
        documentId,
        (current, total) => {
          console.log(`Analyzing sheet ${current}/${total}`)
        }
      )
      
      // Add to brain
      await addDrawingAnalysis(pid, documentId, fileName, analyses)
      
      // Summarize schedules found
      const schedules = analyses.flatMap(a => a.schedules)
      const scheduleSummary = schedules.length > 0
        ? `Found ${schedules.length} schedules: ${schedules.map(s => s.name).join(', ')}`
        : 'No schedules detected'
      
      res.json({
        success: true,
        projectId: pid,
        documentId,
        documentName: fileName,
        type: 'drawing',
        sheetsAnalyzed: analyses.length,
        scheduleSummary,
        sheets: analyses.map(a => ({
          pageNumber: a.pageNumber,
          sheetNumber: a.sheetNumber,
          sheetTitle: a.sheetTitle,
          sheetType: a.sheetType,
          roomCount: a.rooms.length,
          scheduleCount: a.schedules.length,
          confidence: a.confidence
        }))
      })
      
    } else {
      // Text extraction for specs/addenda/contracts
      console.log(`Processing text document: ${fileName}`)
      
      const processed = await processPDF(req.file.buffer, fileName)
      
      await addTextDocument(pid, {
        id: documentId,
        name: fileName,
        type: docType,
        pages: processed.pages,
        chunks: processed.chunks
      })
      
      res.json({
        success: true,
        projectId: pid,
        documentId,
        documentName: fileName,
        type: docType,
        pages: processed.pages,
        chunks: processed.chunks.length
      })
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /documents/list
 * 
 * List all documents in a project
 */
router.get('/list', (req: Request, res: Response) => {
  const { projectId } = req.query
  
  if (!projectId) {
    res.status(400).json({ error: 'projectId required' })
    return
  }
  
  // TODO: Return document list from brain
  res.json({ documents: [] })
})

/**
 * DELETE /documents/:documentId
 * 
 * Remove a document from a project
 */
router.delete('/:documentId', (req: Request, res: Response) => {
  const { documentId } = req.params
  const { projectId } = req.query
  
  // TODO: Implement document removal
  res.json({ success: true, removed: documentId })
})

export default router
