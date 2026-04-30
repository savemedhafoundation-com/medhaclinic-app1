import axios from 'axios';

let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: (() => Promise<string | null>) | null) {
  tokenProvider = provider;
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/v1/admin`,
  timeout: 25_000,
});

api.interceptors.request.use(async config => {
  const token = await tokenProvider?.();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed.';

    return Promise.reject(new Error(message));
  }
);
