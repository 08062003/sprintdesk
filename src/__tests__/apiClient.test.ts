import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

describe('apiFetch auth interceptor', () => {
  beforeEach(() => {
    // reset auth store
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      accessToken: 'oldAccess',
      refreshToken: 'oldRefresh',
      rememberMe: true,
    });
  });

  afterEach(() => {
    // restore fetch
    vi.restoreAllMocks();
  });

  it('refreshes token on 401 and retries original request', async () => {
    const calls: Array<{ url: string; headers?: any; body?: any }> = [];

    // Mock fetch implementation
    vi.stubGlobal('fetch', vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      const headers = init?.headers || {};
      const body = init?.body;
      calls.push({ url, headers, body });

      if (url === '/protected') {
        // First time should be called with old token and return 401
        if ((headers.Authorization || '').includes('oldAccess')) {
          return new Response(null, { status: 401 });
        }
        // After refresh it should be called with new token and succeed
        if ((headers.Authorization || '').includes('newAccess')) {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      if (url === 'https://dummyjson.com/auth/refresh') {
        const parsed = JSON.parse(body);
        if (parsed.refreshToken === 'oldRefresh') {
          return new Response(JSON.stringify({ accessToken: 'newAccess', refreshToken: 'newRefresh' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(null, { status: 400 });
      }

      return new Response(null, { status: 500 });
    }));

    const resp = await apiFetch('/protected', { method: 'GET' });

    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data.ok).toBe(true);

    // Ensure auth store updated
    const auth = useAuthStore.getState();
    expect(auth.accessToken).toBe('newAccess');
    expect(auth.refreshToken).toBe('newRefresh');

    // Validate sequence of calls: original -> refresh -> retry
    expect(calls[0].url).toBe('/protected');
    // Ensure initial request was made
    expect(calls[0].url).toBe('/protected');

    const refreshCall = calls.find(c => c.url === 'https://dummyjson.com/auth/refresh');
    expect(refreshCall).toBeDefined();

    // Ensure original endpoint was called again after refresh
    const protectedCalls = calls.filter(c => c.url === '/protected');
    expect(protectedCalls.length).toBeGreaterThanOrEqual(2);
  });
});
