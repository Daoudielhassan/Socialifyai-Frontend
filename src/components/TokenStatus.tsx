import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Shield, RefreshCw, Clock, Check, X } from '../utils/icons';

interface TokenInfo {
  valid: boolean;
  expiry?: string;
  timeRemaining?: string;
}

export default function TokenStatus() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({ valid: false });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const checkTokenStatus = async () => {
    try {
      const response = await ApiService.getTokenInfo();
      if (response.data) {
        setTokenInfo({
          valid: true,
          expiry: response.data.exp ? new Date(response.data.exp * 1000).toLocaleString() : undefined,
          timeRemaining: response.data.exp ? getTimeRemaining(response.data.exp * 1000) : undefined
        });
      } else {
        setTokenInfo({ valid: false });
      }
    } catch (error) {
      setTokenInfo({ valid: false });
    }
  };

  const refreshToken = async () => {
    setIsRefreshing(true);
    try {
      const response = await ApiService.refreshCurrentToken();
      if (response.data?.access_token) {
        setLastRefresh(new Date().toLocaleString());
        await checkTokenStatus();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeRemaining = (expTimestamp: number): string => {
    const now = Date.now();
    const remaining = expTimestamp - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    checkTokenStatus();
    
    // Check token status every 5 minutes
    const interval = setInterval(checkTokenStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Token Status</h3>
        </div>
        <button
          onClick={refreshToken}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          {tokenInfo.valid ? (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <X className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span className="text-sm text-gray-600">
            Status: {tokenInfo.valid ? 'Valid' : 'Invalid/Expired'}
          </span>
        </div>

        {tokenInfo.expiry && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Expires: {tokenInfo.expiry}
            </span>
          </div>
        )}

        {tokenInfo.timeRemaining && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              Time remaining: {tokenInfo.timeRemaining}
            </span>
          </div>
        )}

        {lastRefresh && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Last refreshed: {lastRefresh}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>🔄 Auto-refresh: Every 6 days</p>
        <p>⏰ Token lifetime: 7 days (168 hours)</p>
      </div>
    </div>
  );
}
