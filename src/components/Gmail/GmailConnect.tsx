import { useState } from 'react';
import { useGmail } from '../../hooks/useGmail';

export const GmailConnect = () => {
  const { connectGmail, disconnectGmail, loading, error, isConnected, connectionStatus } = useGmail();
  const [forceReconnect, setForceReconnect] = useState(false);

  const handleConnect = async () => {
    try {
      await connectGmail(forceReconnect);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your Gmail account?')) {
      try {
        await disconnectGmail();
      } catch (error) {
        console.error('Disconnection failed:', error);
      }
    }
  };

  if (isConnected) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Gmail Connected Successfully
              </h3>
              {connectionStatus?.email && (
                <p className="text-xs text-green-600 mt-1">
                  Connected to: {connectionStatus.email}
                </p>
              )}
              {connectionStatus?.connected_at && (
                <p className="text-xs text-green-600">
                  Connected: {new Date(connectionStatus.connected_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="text-green-800 hover:text-green-600 text-sm font-medium disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
        
        {connectionStatus?.permissions && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-700">
              Permissions: {connectionStatus.permissions.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <svg className="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 5.457v13.086c0 .958-.778 1.736-1.736 1.736H1.736A1.737 1.737 0 010 18.543V5.457c0-.958.778-1.736 1.736-1.736h20.528c.958 0 1.736.778 1.736 1.736z" />
          <path fill="#fff" d="M12 13.2L2.4 6.857h19.2L12 13.2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">Connect Gmail Account</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Connect your Gmail account to start analyzing your email patterns and priorities with AI-powered insights.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <div>
              <p className="font-medium">Connection Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={forceReconnect}
            onChange={(e) => setForceReconnect(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">
            Force reconnect (if already connected)
          </span>
        </label>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </div>
        ) : (
          'Connect Gmail Account'
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 Your privacy is protected. We only access message metadata and never read your email content.</p>
      </div>
    </div>
  );
};
