/**
 * Centralized Admin API Client for BOSTROSHOILY
 * Automatically injects Bearer Token and CSRF Token into all admin requests.
 */

export function getAdminAuthHeaders(isMutation = false): Record<string, string> {
  const token = localStorage.getItem('bastra_admin_token');
  const csrf = localStorage.getItem('bastra_csrf_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isMutation && csrf) {
    headers['X-CSRF-Token'] = csrf;
  }
  return headers;
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const authHeaders = getAdminAuthHeaders(isMutation);

  const mergedHeaders = {
    ...authHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
}
