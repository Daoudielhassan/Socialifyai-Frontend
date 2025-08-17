import React, { useState, useEffect } from 'react';

const RealTimeDebug: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [cookies, setCookies] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const refreshCookies = () => {
    const currentCookies = document.cookie;
    setCookies(currentCookies);
    addLog(`🍪 Cookies actuels: ${currentCookies || 'Aucun cookie trouvé'}`);
  };

  const testProfile = async () => {
    try {
      addLog('🔍 Test de récupération du profil...');
      setError('');
      
      // Test direct de l'API
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      addLog(`📡 Statut de la réponse: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        addLog('✅ Profil récupéré avec succès');
        addLog(`👤 Utilisateur: ${data.data?.email || 'Email non trouvé'}`);
      } else {
        const errorData = await response.text();
        setError(`Erreur ${response.status}: ${errorData}`);
        addLog(`❌ Erreur: ${response.status} - ${errorData}`);
      }
    } catch (err: any) {
      setError(err.message);
      addLog(`❌ Exception: ${err.message}`);
    }
  };

  const testAuthCookies = async () => {
    try {
      addLog('🔐 Test spécifique des cookies d\'authentification...');
      
      // Test direct du callback OAuth (si disponible)
      const authResponse = await fetch('http://localhost:8000/auth/google/callback', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      addLog(`🔐 Auth endpoint status: ${authResponse.status}`);
      
      // Check all headers for Set-Cookie
      const allHeaders = Object.fromEntries(authResponse.headers.entries());
      addLog('🔍 Headers du endpoint auth:');
      Object.entries(allHeaders).forEach(([key, value]) => {
        addLog(`  ${key}: ${value}`);
        if (key.toLowerCase().includes('cookie')) {
          addLog(`  🍪 HEADER COOKIE: ${key} = ${value}`);
        }
      });
      
    } catch (err: any) {
      addLog(`❌ Erreur test auth cookies: ${err.message}`);
    }
  };

  const debugAuthFlow = async () => {
    addLog('🔐 Démarrage du debug complet...');
    
    // 1. Vérifier les cookies
    refreshCookies();
    
    // 2. Tester l'API
    await testProfile();
    
    // 3. Vérifier les headers de réponse
    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        method: 'GET',
        credentials: 'include'
      });
      
      addLog('📋 Headers de réponse:');
      response.headers.forEach((value, key) => {
        addLog(`  ${key}: ${value}`);
        
        // Highlight important headers
        if (key.toLowerCase() === 'set-cookie') {
          addLog(`  🍪 COOKIE TROUVÉ: ${value}`);
        }
      });
      
      // Check if Set-Cookie header is present
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        addLog(`🍪 Header Set-Cookie détecté: ${setCookieHeader}`);
      } else {
        addLog('❌ Aucun header Set-Cookie trouvé - Le backend ne définit pas de cookie!');
      }
    } catch (err) {
      addLog('❌ Impossible de récupérer les headers');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setError('');
    setProfileData(null);
  };

  useEffect(() => {
    refreshCookies();
    addLog('🚀 Debug component initialized');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🔍 Debug Authentification en Temps Réel
        </h1>

        {/* Contrôles */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={refreshCookies}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🍪 Actualiser Cookies
          </button>
          <button
            onClick={testProfile}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            👤 Test Profil API
          </button>
          <button
            onClick={testAuthCookies}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            🔐 Test Auth Cookies
          </button>
          <button
            onClick={debugAuthFlow}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            🔐 Debug Complet
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            🗑️ Effacer Logs
          </button>
        </div>

        {/* État des cookies */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🍪 État des Cookies</h3>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            {cookies || 'Aucun cookie trouvé'}
          </div>
        </div>

        {/* Données du profil */}
        {profileData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">👤 Données du Profil</h3>
            <div className="bg-green-50 p-3 rounded">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {error && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-700 mb-2">❌ Erreur</h3>
            <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Logs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📋 Logs de Debug</h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Aucun log pour le moment...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Test Profil API:</strong> Teste directement l'endpoint /api/v1/user/profile</li>
            <li>• <strong>Debug Complet:</strong> Analyse cookies + API + headers</li>
            <li>• <strong>Attendu:</strong> Cookie 'access_token' avec token JWT</li>
            <li>• <strong>Si pas de cookie:</strong> Le backend ne définit pas le cookie httpOnly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDebug;
