import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback, error } = useOAuth2Auth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error('OAuth2 error:', errorParam);
      navigate('/oauth2-login?error=' + encodeURIComponent(errorParam));
      return;
    }

    if (code && state) {
      handleAuthCallback(code, state)
        .then(() => {
          // Redirect will be handled by the auth context
        })
        .catch((error) => {
          console.error('OAuth2 callback error:', error);
          navigate('/oauth2-login?error=' + encodeURIComponent('callback_failed'));
        });
    } else {
      navigate('/oauth2-login?error=' + encodeURIComponent('missing_parameters'));
    }
  }, [searchParams, handleAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/oauth2-login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Completing Authentication...</h2>
        <p className="text-gray-600">Please wait while we complete your login.</p>
      </div>
    </div>
  );
}
