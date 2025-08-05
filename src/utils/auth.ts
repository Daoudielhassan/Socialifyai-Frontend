interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
};

export const getAuthTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem('access_token') || 
                     sessionStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token') || 
                      sessionStorage.getItem('refresh_token');
  
  if (accessToken && refreshToken) {
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  
  return null;
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthTokens()?.access_token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token') || 
         sessionStorage.getItem('access_token');
};

export default {
  setAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  isAuthenticated,
  getAuthToken,
};
