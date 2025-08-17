import React from 'react';
import { useHttpOnlyAuth } from '../hooks/useHttpOnlyAuth';

/**
 * Composant de test pour valider la configuration httpOnly
 * À utiliser temporairement pour débugger l'authentification
 */
export function CookieAuthTest() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    checkAuth, 
    logout, 
    initiateLogin, 
    debugAuth 
  } = useHttpOnlyAuth();

  const testDirectFetch = async () => {
    console.log('🧪 Test direct fetch avec credentials...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        method: 'GET',
        credentials: 'include', // CRITIQUE pour httpOnly
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Succès:', data);
      } else {
        console.log('❌ Échec:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
    }
  };

  const checkCookies = () => {
    console.log('🍪 Cookies disponibles:');
    console.log('  Document cookies:', document.cookie || 'Aucun cookie visible');
    console.log('  ℹ️ Note: Les cookies httpOnly ne sont pas visibles via JavaScript');
    console.log('  ℹ️ Vérifiez dans DevTools > Application > Cookies');
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800">🔄 Vérification authentification...</h3>
        <p className="text-sm text-blue-600 mt-1">
          Test de la configuration cookie httpOnly en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">🧪 Test Authentification Cookie HttpOnly</h2>
        
        {/* État d'authentification */}
        <div className={`p-3 rounded ${isAuthenticated ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="font-medium mb-2">
            {isAuthenticated ? '✅ Authentifié' : '❌ Non authentifié'}
          </h3>
          
          {isAuthenticated && user ? (
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nom:</strong> {user.full_name}</p>
              <p><strong>Méthode:</strong> {user.auth_method}</p>
              <p><strong>Gmail connecté:</strong> {user.gmail_connected ? '✅' : '❌'}</p>
            </div>
          ) : (
            <div className="text-sm">
              {error ? (
                <p className="text-red-600"><strong>Erreur:</strong> {error}</p>
              ) : (
                <p>Aucune session active trouvée</p>
              )}
            </div>
          )}
        </div>

        {/* Actions de test */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={checkAuth}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            🔄 Vérifier Auth
          </button>
          
          <button
            onClick={checkCookies}
            className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            🍪 Vérifier Cookies
          </button>
          
          <button
            onClick={testDirectFetch}
            className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            🧪 Test Direct Fetch
          </button>
          
          <button
            onClick={debugAuth}
            className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
          >
            🔍 Debug Auth
          </button>
        </div>

        {/* Actions d'authentification */}
        <div className="flex gap-2 mt-4">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🚪 Se déconnecter
            </button>
          ) : (
            <button
              onClick={initiateLogin}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🔐 Se connecter (OAuth)
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-gray-50 border rounded text-sm">
          <h4 className="font-medium mb-2">🔧 Instructions Backend:</h4>
          <div className="space-y-1 text-xs font-mono bg-gray-100 p-2 rounded">
            <p># FastAPI</p>
            <p>response.set_cookie(</p>
            <p>&nbsp;&nbsp;key="access_token",</p>
            <p>&nbsp;&nbsp;value=jwt_token,</p>
            <p>&nbsp;&nbsp;httponly=True,</p>
            <p>&nbsp;&nbsp;secure=False,</p>
            <p>&nbsp;&nbsp;samesite="lax",</p>
            <p>&nbsp;&nbsp;path="/"</p>
            <p>)</p>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            <p>• CORS: allow_credentials=True</p>
            <p>• Frontend: credentials: 'include'</p>
            <p>• Cookie visible dans DevTools &gt; Application &gt; Cookies</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieAuthTest;
