const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError'; // utile pour instanceof / debug
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

// Callback optionnel pour gérer la déconnexion globale (à brancher sur ton store/router)
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers = {}, body, ...rest } = options;

  const isFormData = body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    // Ne pas forcer Content-Type si c'est du FormData (fetch gère le boundary lui-même)
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  // Protection SSR : localStorage n'existe que côté client
  if (auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: isFormData ? body : body,
    });
  } catch (_networkError) {
    // Erreur réseau (offline, CORS, DNS...) — fetch ne la wrap pas en ApiError par défaut
    throw new ApiError('Impossible de contacter le serveur.', 0);
  }

  // 204 No Content : pas de body à parser
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || 'Une erreur est survenue.';
    const errors = data?.errors;

    if (response.status === 401) {
      onUnauthorized?.();
    }

    throw new ApiError(message, response.status, errors);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { auth, method: 'GET' }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, {
      auth,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, {
      auth,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string, auth = false) => request<T>(path, { auth, method: 'DELETE' }),
};




