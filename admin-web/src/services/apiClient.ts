import axios from 'axios';

let accessTokenProvider: (() => Promise<string | null>) | null = null;

export function setAccessTokenProvider(provider: (() => Promise<string | null>) | null) {
  accessTokenProvider = provider;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20_000,
});

apiClient.interceptors.request.use(async config => {
  if (!accessTokenProvider) {
    return config;
  }

  const token = await accessTokenProvider();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
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
