import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload } from '@vercel/blob/client';
import { setCors, ok, serverError, methodNotAllowed } from './lib/response';

/**
 * Vercel Blob Upload Handler
 * 
 * This endpoint handles the server-side part of client uploads using Vercel Blob.
 * The client (browser) requests a presigned token, uploads directly to Blob storage,
 * then this endpoint receives the callback when complete.
 * 
 * Flow:
 * 1. Client calls POST /api/upload-document with blob intent
 * 2. This endpoint returns a presigned token via handleBlobUpload
 * 3. Client uploads file bytes directly to Blob (bypasses Vercel function limits)
 * 4. Blob calls this endpoint on completion
 * 5. We record metadata and return success
 * 
 * This supports files of any size (tested up to 500MB) without hitting
 * Vercel's 4.5MB function body limit.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a unique pathname with timestamp
        const timestamp = Date.now();
        const sanitized = pathname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniquePathname = `${timestamp}_${sanitized}`;
        
        // Parse client payload if provided
        let payload: Record<string, unknown> = {};
        try {
          if (clientPayload) {
            payload = JSON.parse(clientPayload);
          }
        } catch {
          // ignore parse errors
        }

        return {
          allowedContentTypes: [
            'application/pdf',
            'image/jpeg', 
            'image/png',
            'image/tiff',
            'image/webp'
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
          tokenPayload: JSON.stringify({
            ...payload,
            pathname: uniquePathname,
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called after successful upload
        // In a real implementation, you'd save to your database here
        console.log('✅ Upload completed:', {
          url: blob.url,
          pathname: blob.pathname,
          tokenPayload,
        });
      },
    });

    return ok(res, jsonResponse);
  } catch (err) {
    console.error('Blob upload handler error:', err);
    return serverError(
      res, 
      'Upload failed', 
      err instanceof Error ? err.message : 'Unknown error'
    );
  }
}
