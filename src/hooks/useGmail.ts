import { useState, useEffect } from 'react';
import { GmailService } from '../services/gmailService';
import type { 
  GmailConnectionStatus, 
  GmailFetchOptions, 
  GmailFetchResponse, 
  GmailStats 
} from '../types/api';

interface UseGmailReturn {
  // State
  messages: any[]; // TODO: Define proper message type
  stats: GmailStats | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus: GmailConnectionStatus | null;
  
  // Actions
  connectGmail: (forceReconnect?: boolean) => Promise<GmailConnectionStatus>;
  disconnectGmail: () => Promise<{ status: string }>;
  fetchMessages: (options?: GmailFetchOptions) => Promise<GmailFetchResponse>;
  loadStats: (days?: number) => Promise<GmailStats>;
  refreshMessages: () => Promise<GmailFetchResponse>;
  checkConnectionStatus: () => Promise<void>;
  clearError: () => void;
}

export const useGmail = (): UseGmailReturn => {
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<GmailConnectionStatus | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async (): Promise<void> => {
    try {
      const status = await GmailService.getConnectionStatus();
      setIsConnected(status.connected || false);
      setConnectionStatus(status);
    } catch (error) {
      console.error('Failed to check Gmail connection status:', error);
      setIsConnected(false);
    }
  };

  const connectGmail = async (forceReconnect = false): Promise<GmailConnectionStatus> => {
    try {
      setLoading(true);
      setError(null);
      const result = await GmailService.connectGmail(forceReconnect);
      setIsConnected(result.status === 'connected');
      setConnectionStatus(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setIsConnected(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectGmail = async (): Promise<{ status: string }> => {
    try {
      setLoading(true);
      setError(null);
      const result = await GmailService.disconnectGmail();
      setIsConnected(false);
      setConnectionStatus(null);
      setMessages([]);
      setStats(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (options: GmailFetchOptions = {}): Promise<GmailFetchResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await GmailService.fetchMessages(options);
      
      // Handle pagination - append if pageToken, replace if new search
      if (options.pageToken) {
        setMessages(prev => [...prev, ...result.messages]);
      } else {
        setMessages(result.messages || []);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (days = 30): Promise<GmailStats> => {
    try {
      setError(null);
      const result = await GmailService.getStats(days);
      setStats(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshMessages = (): Promise<GmailFetchResponse> => {
    setMessages([]);
    return fetchMessages();
  };

  const clearError = (): void => setError(null);

  return {
    // State
    messages,
    stats,
    loading,
    error,
    isConnected,
    connectionStatus,
    
    // Actions
    connectGmail,
    disconnectGmail,
    fetchMessages,
    loadStats,
    refreshMessages,
    checkConnectionStatus,
    clearError
  };
};
