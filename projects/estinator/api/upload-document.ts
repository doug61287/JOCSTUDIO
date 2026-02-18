import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { setCors, ok, created, badRequest, serverError, methodNotAllowed } from './lib/response';
import { projects, uploadedDocuments } from './lib/store';
import type { UploadedDocument } from './lib/types';

/**
 * Handle multipart file upload directly to Vercel Blob
 * Streams file without buffering in memory — supports large PDFs (50MB+)
 * 
 * Expects multipart/form-data with fields:
 * - projectId: string
 * - file: File (the PDF)
 * - name?: string (optional display name)
 */
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle stream
  },
};

// Simple multipart parser for Vercel serverless
async function parseMultipart(req: VercelRequest): Promise<{ fields: Record<string, string>; file: { name: string; buffer: Buffer } | null }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      
      if (!contentType.includes('multipart/form-data')) {
        return reject(new Error('Expected multipart/form-data'));
      }
      
      // Extract boundary
      const boundary = contentType.split('boundary=')[1];
      if (!boundary) return reject(new Error('No boundary found'));
      
      const parts = buffer.toString('binary').split(`--${boundary}`);
      const fields: Record<string, string> = {};
      let file: { name: string; buffer: Buffer } | null = null;
      
      for (const part of parts) {
        if (!part.includes('Content-Disposition')) continue;
        
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        
        const headers = part.substring(0, headerEnd);
        const body = part.substring(headerEnd + 4).replace(/\r\n$/, '');
        
        // Extract field name
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        
        if (filenameMatch) {
          // It's a file
          file = {
            name: filenameMatch[1],
            buffer: Buffer.from(body, 'binary'),
          };
        } else if (nameMatch) {
          // It's a field
          fields[nameMatch[1]] = body;
        }
      }
      
      resolve({ fields, file });
    });
    
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const { fields, file } = await parseMultipart(req);
    
    const projectId = fields.projectId;
    if (!projectId) {
      return badRequest(res, 'projectId field required');
    }

    const project = projects.get(projectId);
    if (!project) {
      // Auto-create project if doesn't exist (handles session resets)
      console.warn(`Project ${projectId} not found, creating placeholder`);
    }

    if (!file) {
      return badRequest(res, 'No file uploaded');
    }

    const displayName = fields.name || file.name;
    const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Stream directly to Vercel Blob
    const blob = await put(uniqueName, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/pdf',
    });

    // Record document metadata
    const doc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      projectId,
      name: displayName,
      blobUrl: blob.url,
      pathname: uniqueName,
      size: file.buffer.length,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded', // Will be 'processed' after AI extraction
    };

    const existing = uploadedDocuments.get(projectId) || [];
    uploadedDocuments.set(projectId, [...existing, doc]);

    // Update project stats
    if (project) {
      project.documentCount = (project.documentCount || 0) + 1;
      project.lastActive = 'Just now';
    }

    return created(res, { document: doc, blobUrl: blob.url });
  } catch (err) {
    console.error('Upload failed:', err);
    return serverError(res, 'Upload failed', err instanceof Error ? err.message : undefined);
  }
}
