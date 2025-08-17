import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brain, Shield, Lock, AlertCircle } from '../utils/icons';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';

export default function OAuth2Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  
  const { initiateGoogleAuth, isAuthenticated, error: authError } = useOAuth2Auth();

  // Check for error from URL params
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'You denied access to your Google account',
        'callback_failed': 'Authentication callback failed',
        'missing_parameters': 'Authentication parameters missing',
        'server_error': 'Server error during authentication'
      };
      setError(errorMessages[urlError] || 'Authentication failed');
    }
  }, [searchParams]);

  // Handle auth context error
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await initiateGoogleAuth();
      // Redirect will be handled by the OAuth2 flow
    } catch (error: any) {
      setError(error.message || 'Failed to start authentication');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Socialify
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Privacy-first AI email prioritization
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                100% Privacy Protected
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                We only access message metadata, never content. Your emails are processed in memory only and never stored.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Authentication Error</p>
                  <p className="mt-1">{error}</p>
                  {error.includes('cookie') && (
                    <p className="mt-2 text-xs text-red-500">
                      <strong>Backend Issue:</strong> The server needs to configure httpOnly cookies for authentication.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Secure Login Notice */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Lock className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">Secure OAuth2 Login</span>
              </div>
              <p className="text-xs text-gray-500">
                We use Google's secure OAuth2 authentication. No passwords are stored.
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Redirecting to Google...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </div>
              )}
            </button>

            {/* Privacy Features */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">What we access:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Read-only access to email metadata only
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Sender domains (not full addresses)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Never email content or bodies
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Never stored on our servers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            New to Socialify?{' '}
            <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
              Learn about our privacy approach
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
