import type { VercelRequest, VercelResponse } from '@vercel/node';
import { projects, contexts, uploadedDocuments } from './lib/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  const project = projects.get(id as string);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const context = contexts.get(id as string) || {
    scopes: [],
    documents: [],
    materials: []
  };
  
  // Get uploaded documents
  const uploaded = uploadedDocuments.get(id as string) || [];
  
  // Merge with seeded documents
  const mergedDocuments = [...context.documents, ...uploaded];
  
  // Include packages if they exist (for demo project)
  const packages = (context as any).packages || [];
  
  return res.json({
    ...context,
    documents: mergedDocuments,
    packages
  });
}