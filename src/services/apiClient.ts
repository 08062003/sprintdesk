import { useAuthStore } from '../store/authStore';

// Store for retry queue during token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Enhanced fetch wrapper with interceptors
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refreshToken, setTokens, clearTokens, rememberMe } = useAuthStore.getState();
  
  // Clone options to avoid mutation
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  if (accessToken) {
    (fetchOptions.headers as Record<string, string>)['Authorization'] = 'Bearer ' + accessToken;
  }

  let response = await fetch(url, fetchOptions);

  // Handle 401 - token expired
  if (response.status === 401 && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const refreshResponse = await fetch('https://dummyjson.com/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            refreshToken, 
            expiresIn: rememberMe ? 2592000 : 3600 
          })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          
          // Update store
          setTokens(newAccessToken, newRefreshToken);
          
          isRefreshing = false;
          onTokenRefreshed(newAccessToken);
          
          // Retry original request with new token
          (fetchOptions.headers as Record<string, string>)['Authorization'] = 'Bearer ' + newAccessToken;
          response = await fetch(url, fetchOptions);
        } else {
          // Refresh failed, clear tokens
          clearTokens();
          isRefreshing = false;
          refreshSubscribers = [];
          
          // Redirect to login will be handled by route protection
          throw new Error('Session expired');
        }
      } catch (error) {
        isRefreshing = false;
        clearTokens();
        refreshSubscribers = [];
        throw error;
      }
    } else {
      // Wait for token refresh to complete
      await new Promise<void>((resolve) => {
        subscribeTokenRefresh((token) => {
          (fetchOptions.headers as Record<string, string>)['Authorization'] = 'Bearer ' + token;
          resolve();
        });
      });
      
      // Retry original request with new token
      response = await fetch(url, fetchOptions);
    }
  }

  return response;
}

// Convenience methods
export const api = {
  get: (url: string) => apiFetch(url, { method: 'GET' }),
  post: (url: string, data: unknown) => apiFetch(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (url: string, data: unknown) => apiFetch(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (url: string) => apiFetch(url, { method: 'DELETE' }),
  patch: (url: string, data: unknown) => apiFetch(url, { 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  }),
};
