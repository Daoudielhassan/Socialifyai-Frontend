interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// ⚠️ WARNING: These functions are deprecated when using httpOnly cookies
// HttpOnly cookies are managed server-side and cannot be accessed via JavaScript
// These functions are kept for backward compatibility only

export const setAuthTokens = (tokens: AuthTokens): void => {
  console.warn('⚠️ setAuthTokens() is deprecated when using httpOnly cookies');
  console.warn('⚠️ Tokens should be set server-side as httpOnly cookies');
  console.warn('⚠️ Attempted to set tokens:', tokens ? 'provided' : 'null');
  // Don't store tokens in localStorage when using httpOnly cookies
  // This is a security risk and defeats the purpose of httpOnly cookies
};

export const getAuthTokens = (): AuthTokens | null => {
  console.warn('⚠️ getAuthTokens() is deprecated when using httpOnly cookies');
  console.warn('⚠️ HttpOnly cookies cannot be accessed via JavaScript');
  // With httpOnly cookies, tokens are not accessible to JavaScript
  return null;
};

export const clearAuthTokens = (): void => {
  console.warn('⚠️ clearAuthTokens() is deprecated when using httpOnly cookies');
  console.warn('⚠️ Use server-side logout to clear httpOnly cookies');
  
  // Legacy cleanup - remove any old tokens that might be stored
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    // Clear other legacy token storage
    localStorage.removeItem('socialify_token');
    sessionStorage.removeItem('socialify_token');
    sessionStorage.removeItem('jwt_token');
  }
};

export const isAuthenticated = (): boolean => {
  console.warn('⚠️ isAuthenticated() cannot reliably check httpOnly cookies');
  console.warn('⚠️ Use API calls to check authentication status');
  // With httpOnly cookies, we can't reliably check authentication client-side
  // The app should use API calls to determine authentication status
  return false;
};

export const getAuthToken = (): string | null => {
  console.warn('⚠️ getAuthToken() is deprecated when using httpOnly cookies');
  console.warn('⚠️ HttpOnly cookies cannot be accessed via JavaScript');
  // With httpOnly cookies, tokens are not accessible to JavaScript
  return null;
};

// New helper function for httpOnly cookie authentication
export const checkAuthenticationStatus = async (): Promise<boolean> => {
  try {
    // Make a test request to see if we're authenticated
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

export default {
  setAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  isAuthenticated,
  getAuthToken,
  checkAuthenticationStatus,
};
