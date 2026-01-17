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
