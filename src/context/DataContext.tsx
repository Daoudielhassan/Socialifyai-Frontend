import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '../services/api';
import { useOAuth2Auth } from './OAuth2AuthContext';

export interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  source: 'gmail' | 'whatsapp';
  priority: 'very_urgent' | 'important' | 'not_important';
  context: 'business' | 'personal';
  confidence: number;
  isRead: boolean;
  fullContent?: string;
}

export interface AnalyticsData {
  contextData: Array<{ name: string; value: number; color: string }>;
  priorityData: Array<{ name: string; very_urgent: number; important: number; not_important: number }>;
  feedbackData: Array<{ name: string; correct: number; incorrect: number }>;
  messageVolumeData: Array<{ name: string; messages: number }>;
  totalMessages: number;
  urgentMessages: number;
  accuracyRate: number;
}

interface DataContextType {
  messages: Message[];
  analytics: AnalyticsData | null;
  isLoadingMessages: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
  
  // Message operations
  fetchMessages: (params?: any) => Promise<void>;
  triggerMessageFetch: (source?: 'gmail' | 'whatsapp') => Promise<void>;
  submitFeedback: (messageId: string, correctedPriority: string, correctedContext: string) => Promise<void>;
  predictMessage: (messageData: any) => Promise<any>;
  
  // Analytics operations
  fetchAnalytics: (timeRange?: string) => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication status
  const { user, isLoading: authLoading } = useOAuth2Auth();

  // Fetch messages from the API
  const fetchMessages = async (params = {}) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      // Use new getProcessedMessages method instead of deprecated getMessages
      const response = await ApiService.getProcessedMessages(params);
      
      if (response.data?.messages && Array.isArray(response.data.messages)) {
        setMessages(response.data.messages);
      } else if (response.data && Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        console.warn('Invalid messages response format:', response);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setError(error.message || 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Trigger message fetch from Gmail/WhatsApp
  const triggerMessageFetch = async (source: 'gmail' | 'whatsapp' = 'gmail'): Promise<void> => {
    try {
      setError(null);
      
      // Use new Gmail-specific method for Gmail, keep deprecated for WhatsApp compatibility
      let response;
      if (source === 'gmail') {
        response = await ApiService.fetchGmailMessages({ limit: 50, privacyMode: true });
      } else {
        // WhatsApp not yet supported in new API, use deprecated method
        console.warn('⚠️ WhatsApp fetch using deprecated method');
        response = await ApiService.fetchMessages(source);
      }
      
      if (response.success || response.data) {
        // Refresh messages after fetch
        await fetchMessages();
      }
    } catch (error: any) {
      console.error('Error triggering message fetch:', error);
      setError(error.message || 'Failed to fetch new messages');
      throw error;
    }
  };

  // Submit feedback for message prediction
  const submitFeedback = async (messageId: string, correctedPriority: string, correctedContext: string): Promise<void> => {
    try {
      setError(null);
      
      // Use new submitPredictionFeedback method
      await ApiService.submitPredictionFeedback(
        messageId, 
        correctedPriority, 
        5, // feedback quality score
        correctedContext // notes
      );
      
      // Update the local message data
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, priority: correctedPriority as any, context: correctedContext as any }
            : msg
        )
      );
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setError(error.message || 'Failed to submit feedback');
      throw error;
    }
  };

  // Predict message priority and context
  const predictMessage = async (messageData: any) => {
    try {
      setError(null);
      
      // Use new predictMessagePriority method
      const response = await ApiService.predictMessagePriority(messageData, {});
      return response;
    } catch (error: any) {
      console.error('Error predicting message:', error);
      setError(error.message || 'Failed to predict message');
      throw error;
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async (timeRange = '30d') => {
    try {
      setIsLoadingAnalytics(true);
      setError(null);
      
      // Convert timeRange to days (e.g., '30d' -> 30)
      const days = parseInt(timeRange.replace('d', '')) || 30;
      
      let response;
      if (user?.id) {
        // Use new getUserAnalytics if we have user ID
        response = await ApiService.getUserAnalytics(user.id, { days, includeTrends: true });
      } else {
        // Fallback to deprecated method for backward compatibility
        console.warn('⚠️ No user ID available, using deprecated getAnalytics method');
        response = await ApiService.getAnalytics();
      }
      
      if (response.data) {
        setAnalytics(response.data);
      } else if (response) {
        setAnalytics(response as any);
      } else {
        console.warn('Invalid analytics response format:', response);
        setAnalytics(null);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchMessages(),
      fetchAnalytics()
    ]);
  };

  // Initial data load - only when user is authenticated
  useEffect(() => {
    // Only fetch data if user is authenticated and auth is not loading
    if (user && !authLoading) {
      refreshData();
    }
  }, [user, authLoading]);

  const value = {
    messages,
    analytics,
    isLoadingMessages,
    isLoadingAnalytics,
    error,
    fetchMessages,
    triggerMessageFetch,
    submitFeedback,
    predictMessage,
    fetchAnalytics,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContext;
