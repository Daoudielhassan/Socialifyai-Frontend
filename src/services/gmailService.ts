import ApiService from './api';
import type { 
  GmailConnectionStatus, 
  GmailFetchOptions, 
  GmailFetchResponse, 
  GmailStats 
} from '../types/api';

export class GmailService {
  // Connect Gmail account
  static async connectGmail(forceReconnect = false): Promise<GmailConnectionStatus> {
    try {
      const response = await ApiService.request<GmailConnectionStatus>('/api/v1/gmail/connect', {
        method: 'POST',
        body: JSON.stringify({ force_reconnect: forceReconnect })
      });
      return response.data || response as unknown as GmailConnectionStatus;
    } catch (error) {
      throw new Error(`Failed to connect Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch messages with pagination
  static async fetchMessages(options: GmailFetchOptions = {}): Promise<GmailFetchResponse> {
    const { 
      limit = 50, 
      privacyMode = true, 
      query = '', 
      maxResults = 100,
      pageToken = null 
    } = options;

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        privacy_mode: privacyMode.toString(),
        max_results: maxResults.toString(),
        ...(query && { query }),
        ...(pageToken && { page_token: pageToken })
      });

      const response = await ApiService.request<GmailFetchResponse>(`/api/v1/gmail/messages?${params}`);
      return response.data || response as unknown as GmailFetchResponse;
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get Gmail statistics
  static async getStats(days = 30): Promise<GmailStats> {
    try {
      const response = await ApiService.request<GmailStats>(`/api/v1/gmail/stats?days=${days}`);
      return response.data || response as unknown as GmailStats;
    } catch (error) {
      throw new Error(`Failed to get Gmail stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check Gmail connection status
  static async getConnectionStatus(): Promise<GmailConnectionStatus> {
    try {
      const response = await ApiService.request<GmailConnectionStatus>('/api/v1/gmail/status');
      return response.data || response as unknown as GmailConnectionStatus;
    } catch (error) {
      throw new Error(`Failed to get Gmail status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Disconnect Gmail account
  static async disconnectGmail(): Promise<{ status: string }> {
    try {
      const response = await ApiService.request<{ status: string }>('/api/v1/gmail/disconnect', {
        method: 'POST'
      });
      return response.data || response as unknown as { status: string };
    } catch (error) {
      throw new Error(`Failed to disconnect Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
