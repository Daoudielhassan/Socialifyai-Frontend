import { getAuthToken } from './auth';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const fetchWithAuth = async <T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export default fetchWithAuth;
