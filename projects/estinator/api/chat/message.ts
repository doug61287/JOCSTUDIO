import type { VercelRequest, VercelResponse } from '@vercel/node';
import { projects, conversations, uploadedDocuments } from '../lib/store';
import { generateResponse } from '../lib/ai';
import { setCors, ok, badRequest, notFound, serverError, methodNotAllowed, requireFields } from '../lib/response';
import type { ConversationMessage } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return methodNotAllowed(res);

  const body = req.body as Record<string, unknown>;
  const validationError = requireFields(body, ['projectId', 'message']);
  if (validationError) return badRequest(res, validationError);

  const { projectId, message, contextId, contextType, contextName, metadata } = body as {
    projectId: string;
    message: string;
    contextId?: string;
    contextType?: 'drawing' | 'spec' | 'schedule' | 'material';
    contextName?: string;
    metadata?: { discipline?: string; packageId?: string; sheetCount?: number; sheets?: Array<{ id: string; number: string; title: string }> };
  };

  const project = projects.get(projectId);
  if (!project) return notFound(res, 'Project not found');

  const convKey = `${projectId}_${contextId ?? 'general'}`;
  const history = conversations.get(convKey) ?? [];
  const docs = uploadedDocuments.get(projectId) ?? [];

  try {
    const { response: aiResponse, model, tokens } = await generateResponse(
      message,
      {
        projectId,
        projectName: project.name,
        contextId,
        contextType,
        contextName: contextName ?? contextId,
        selectedScopes: project.selectedScopes,
        documentCount: project.documentCount,
        uploadedDocs: docs,
        metadata,
      },
      history.map(m => ({ role: m.role, content: m.content }))
    );

    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const assistantMsg: ConversationMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      model,
    };

    const updated = [...history, userMsg, assistantMsg].slice(-50);
    conversations.set(convKey, updated);
    project.lastActive = 'Just now';

    return ok(res, { response: aiResponse, model, tokens, timestamp: new Date().toISOString() });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Chat error:', details);
    return serverError(res, 'Failed to generate response', details);
  }
}
