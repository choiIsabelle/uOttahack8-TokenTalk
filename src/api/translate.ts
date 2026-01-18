export interface TranslateRequest {
  role: string | null;
  from: string | null;
  to: string | null;
  text: string;
}

export interface TranslateResponse {
  translation: string;
  original: string;
  from: string;
  to: string;
  role: string;
}

export interface ModelTranslation {
  key: string;
  name: string;
  translation: string | null;
  error: string | null;
}

export interface MultiTranslateResponse {
  original: string;
  from: string;
  to: string;
  role: string;
  translations: ModelTranslation[];
}

export interface Model {
  key: string;
  id: string;
  name: string;
}

const API_BASE = ''; // Uses Vite proxy - calls go to /api/translate

export async function translateText(data: TranslateRequest): Promise<TranslateResponse> {
  const response = await fetch(`${API_BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Translation failed');
  }

  return response.json();
}

// Translate with all models in parallel
export async function translateWithAllModels(data: TranslateRequest): Promise<MultiTranslateResponse> {
  const response = await fetch(`${API_BASE}/api/translate-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Translation failed');
  }

  return response.json();
}

// Get available models
export async function getModels(): Promise<Model[]> {
  const response = await fetch(`${API_BASE}/api/models`);
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }
  const data = await response.json();
  return data.models;
}
