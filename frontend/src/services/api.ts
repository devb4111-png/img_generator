export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    connected: boolean;
    state: string;
    host: string | null;
    name: string | null;
    error?: string;
  };
  storage: {
    uploadsReady: boolean;
    generatedReady: boolean;
  };
}

export interface TemplatePlacements {
  logo: {
    x: number;
    y: number;
    width: number;
    height: number;
    isNormalized?: boolean;
  };
  organizationName: {
    x: number;
    y: number;
    fontSize: number;
    fontColor: string;
    textAlign: 'left' | 'center' | 'right';
    maxTextWidth: number;
    isNormalized?: boolean;
  };
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  previewUrl: string;
  backgroundUrl: string;
  placements: TemplatePlacements;
}

export interface GenerationResult {
  id: string;
  generationMode: 'TEMPLATE' | 'AI';
  templateName?: string;
  organizationName: string;
  originalCreativeIdea?: string;
  structuredPrompt?: string;
  width: number;
  height: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  previewUrl: string;
  downloadUrl: string;
  createdAt: string;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Helper to convert relative server API paths to full URLs
export function getFullApiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If the path already has /api in it (e.g. /api/generations/123/view)
  if (cleanPath.startsWith('/api/')) {
    const origin = API_BASE_URL.replace(/\/api$/, '');
    return `${origin}${cleanPath}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/health`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP status ${response.status}`);
  }

  return response.json();
}

export async function fetchTemplates(): Promise<TemplateItem[]> {
  const url = `${API_BASE_URL}/templates`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch templates (${response.status})`);
  }

  const json = await response.json();
  return json.data || [];
}

export async function generateTemplateImage(formData: FormData): Promise<GenerationResult> {
  const url = `${API_BASE_URL}/generations/template`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Image generation failed with status ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

export async function generateAiImage(formData: FormData): Promise<GenerationResult> {
  const url = `${API_BASE_URL}/generations/ai`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `AI Image generation failed with status ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

export async function fetchGenerationById(id: string): Promise<GenerationResult> {
  const url = `${API_BASE_URL}/generations/${id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to load generation with ID ${id}`);
  }

  const json = await response.json();
  return json.data;
}
