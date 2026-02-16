/**
 * PDF to Image Conversion
 * 
 * Converts PDF pages to base64-encoded images for vision analysis.
 * Uses pdf-poppler for high-quality conversion.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

export interface PageImage {
  pageNumber: number
  base64: string
  mimeType: 'image/png' | 'image/jpeg'
  width?: number
  height?: number
}

/**
 * Convert PDF buffer to array of page images
 * 
 * Uses pdftoppm (from poppler) for conversion.
 * Falls back to pdf-lib + canvas if poppler isn't available.
 */
export async function pdfToImages(
  pdfBuffer: Buffer,
  options: {
    dpi?: number
    format?: 'png' | 'jpeg'
    maxPages?: number
  } = {}
): Promise<PageImage[]> {
  const { dpi = 150, format = 'png', maxPages = 100 } = options
  
  // Create temp directory for processing
  const tempDir = path.join(os.tmpdir(), `estinator-${uuidv4()}`)
  const pdfPath = path.join(tempDir, 'input.pdf')
  const outputPrefix = path.join(tempDir, 'page')
  
  try {
    await fs.mkdir(tempDir, { recursive: true })
    await fs.writeFile(pdfPath, pdfBuffer)
    
    // Check if pdftoppm is available
    const hasPdftoppm = await checkCommand('pdftoppm')
    
    if (hasPdftoppm) {
      return await convertWithPoppler(pdfPath, outputPrefix, { dpi, format, maxPages })
    } else {
      // Fallback: use pdf.js + canvas (requires separate implementation)
      console.warn('pdftoppm not found, using fallback conversion')
      return await convertWithFallback(pdfBuffer, { dpi, format, maxPages })
    }
    
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Convert using poppler's pdftoppm
 */
async function convertWithPoppler(
  pdfPath: string,
  outputPrefix: string,
  options: { dpi: number; format: 'png' | 'jpeg'; maxPages: number }
): Promise<PageImage[]> {
  const formatFlag = options.format === 'png' ? '-png' : '-jpeg'
  const lastPage = options.maxPages > 0 ? `-l ${options.maxPages}` : ''
  
  const cmd = `pdftoppm ${formatFlag} -r ${options.dpi} ${lastPage} "${pdfPath}" "${outputPrefix}"`
  
  try {
    await execAsync(cmd)
  } catch (error) {
    throw new Error(`PDF conversion failed: ${error}`)
  }
  
  // Read generated images
  const dir = path.dirname(outputPrefix)
  const prefix = path.basename(outputPrefix)
  const files = await fs.readdir(dir)
  
  const imageFiles = files
    .filter(f => f.startsWith(prefix) && (f.endsWith('.png') || f.endsWith('.jpg')))
    .sort((a, b) => {
      // Sort by page number
      const numA = parseInt(a.match(/-(\d+)\./)?.[1] || '0')
      const numB = parseInt(b.match(/-(\d+)\./)?.[1] || '0')
      return numA - numB
    })
  
  const pages: PageImage[] = []
  
  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = path.join(dir, imageFiles[i])
    const buffer = await fs.readFile(filePath)
    
    pages.push({
      pageNumber: i + 1,
      base64: buffer.toString('base64'),
      mimeType: options.format === 'png' ? 'image/png' : 'image/jpeg'
    })
  }
  
  return pages
}

/**
 * Fallback conversion using pdf-lib
 * This is a simpler approach that may have lower quality
 */
async function convertWithFallback(
  pdfBuffer: Buffer,
  options: { dpi: number; format: 'png' | 'jpeg'; maxPages: number }
): Promise<PageImage[]> {
  // Dynamic import to avoid loading if not needed
  const { PDFDocument } = await import('pdf-lib')
  
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const pageCount = Math.min(pdfDoc.getPageCount(), options.maxPages)
  
  // For fallback, we'll use a canvas-based approach
  // This requires additional setup, so for now we'll throw an error
  // recommending poppler installation
  
  throw new Error(
    `PDF conversion requires poppler-utils. Install with:\n` +
    `  macOS: brew install poppler\n` +
    `  Ubuntu: apt-get install poppler-utils\n` +
    `  Windows: Use chocolatey or download from poppler website`
  )
}

/**
 * Check if a command is available
 */
async function checkCommand(cmd: string): Promise<boolean> {
  try {
    await execAsync(`which ${cmd}`)
    return true
  } catch {
    return false
  }
}

/**
 * Get page count from PDF without full conversion
 */
export async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  return pdfDoc.getPageCount()
}
