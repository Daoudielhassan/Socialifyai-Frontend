import React from 'react';
import { Link } from 'react-router-dom';

export default function DevelopmentStatus() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs text-yellow-800 shadow-lg max-w-xs">
      <div className="font-semibold mb-2">🚧 Development Status</div>
      <div className="space-y-1">
        <div>✅ Original Auth: Working</div>
        <div>🔄 OAuth2 Auth: In Development</div>
        <div>🔧 Backend API: Update Required</div>
      </div>
      <div className="mt-2 pt-2 border-t border-yellow-300">
        <Link 
          to="/oauth2-login" 
          className="text-blue-600 hover:text-blue-800 text-xs underline"
        >
          Test OAuth2 Login →
        </Link>
      </div>
    </div>
  );
}
