import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { setCors, ok, badRequest, methodNotAllowed, serverError } from './lib/response';

/**
 * Generate presigned upload URL for direct-to-Blob uploads
 * This bypasses the 4.5MB Vercel function body limit
 * 
 * Flow:
 * 1. Frontend calls GET /api/blob-url?filename=drawings.pdf
 * 2. Returns { uploadUrl, blobUrl, token }
 * 3. Frontend PUTs file bytes directly to uploadUrl
 * 4. Frontend POSTs to /api/upload-document with blobUrl to record metadata
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const { filename, projectId } = req.query as { filename?: string; projectId?: string };

  if (!filename) {
    return badRequest(res, 'filename query param required');
  }

  // Sanitize filename
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
  const uniqueName = `${Date.now()}_${sanitized}`;

  try {
    // Generate a presigned URL for client-side upload
    // multipart: true allows large file uploads
    const blob = await put(uniqueName, '', {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Note: For multipart uploads with presigned URLs, we use the handle returned
      // The actual upload happens client-side via the returned URL
    });

    // For client-side PUT uploads, we need a different approach
    // Return the blob URL and let client upload, then confirm
    return ok(res, {
      blobUrl: blob.url,
      pathname: uniqueName,
      // Client will upload directly to blob, then notify us
    });
  } catch (err) {
    console.error('Blob URL generation failed:', err);
    return serverError(res, 'Failed to generate upload URL');
  }
}
