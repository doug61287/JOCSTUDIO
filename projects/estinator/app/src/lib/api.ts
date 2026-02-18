// API Client for BuilderBrain
// Uses relative URLs - works when frontend and API are on same domain
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Project APIs
export const projectsApi = {
  list: () => apiFetch<any[]>('/projects'),
  get: (id: string) => apiFetch<any>(`/projects/${id}`),
  create: (data: { name: string; owner: string; location: string }) => 
    apiFetch<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  uploadDocument: (projectId: string, fileData: { name: string; type: string; size: number }) => 
    apiFetch<any>(`/projects/${projectId}/documents`, { 
      method: 'POST', 
      body: JSON.stringify(fileData) 
    }),
};

// Context APIs (scope/docs/materials)
export const contextApi = {
  getItems: (projectId: string) => apiFetch<any>(`/projects/${projectId}/context`),
};

// Chat APIs
export const chatApi = {
  sendMessage: (data: { 
    projectId: string; 
    message: string; 
    contextId?: string;
    contextType?: string;
    contextName?: string;
    metadata?: { discipline?: string; packageId?: string; sheetCount?: number; sheets?: Array<{ id: string; number: string; title: string }> };
  }) => apiFetch<any>('/chat/message', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  getHistory: (projectId: string, contextId?: string) => 
    apiFetch<any>(`/chat/history?projectId=${projectId}${contextId ? `&contextId=${contextId}` : ''}`),
};

// Issues APIs
export const issuesApi = {
  list: (projectId: string) => apiFetch<any[]>(`/projects/${projectId}/issues`),
  create: (data: { projectId: string; title: string; description: string; trade: string }) => 
    apiFetch<any>('/issues', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => 
    apiFetch<any>(`/issues/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export default { projectsApi, contextApi, chatApi, issuesApi };
