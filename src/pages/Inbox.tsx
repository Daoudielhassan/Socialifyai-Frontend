import { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Mail, 
  Clock, 
  Archive, 
  Trash2, 
  RefreshCw,
  Settings,
  Zap,
  TrendingUp
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import MessageCard, { Message } from '../components/UI/MessageCard';
import FeedbackModal from '../components/Modals/FeedbackModal';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { Priority } from '../components/UI/PriorityTag';
import { Context } from '../components/UI/ContextTag';
import { useData } from '../context/DataContext';
import apiService, { V1MessageResponse, ApiResponse } from '../services/api';

// Helper functions to map API response to local types
const mapApiPriorityToLocal = (apiPriority: string): Priority => {
  switch (apiPriority) {
    case 'high':
    case 'urgent':
      return 'very_urgent';
    case 'medium':
    case 'important':
      return 'important';
    case 'low':
    case 'normal':
    default:
      return 'not_important';
  }
};

const mapApiContextToLocal = (apiContext: string): Context => {
  switch (apiContext) {
    case 'business':
    case 'work':
      return 'business';
    case 'education':
    case 'learning':
      return 'education';
    case 'personal':
      return 'personal';
    case 'social':
    case 'networking':
      return 'social';
    case 'promotions':
    case 'marketing':
    case 'commercial':
      return 'promotions';
    case 'general':
    default:
      return 'general'; // Default fallback
  }
};

export default function Inbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [apiMessages, setApiMessages] = useState<Message[]>([]);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    hasNext: false
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    important: 0
  });
  
  const [filters, setFilters] = useState({
    source: 'all',
    context: 'all',
    priority: 'all',
    unreadOnly: false,
    timeRange: '7', // days
  });

  const { messages, isLoadingMessages, submitFeedback } = useData();

  // Get messages from API with filters
  const getMessages = async (loadMore = false) => {
    setIsLoadingCustom(true);
    try {
      const currentOffset = loadMore ? pagination.offset + pagination.limit : 0;
      
      console.log('🔄 Fetching messages with params:', {
        limit: pagination.limit,
        offset: currentOffset,
        source: filters.source !== 'all' ? filters.source : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        context: filters.context !== 'all' ? filters.context : undefined,
        search: searchQuery || undefined,
        days: filters.timeRange !== 'all' ? parseInt(filters.timeRange) : undefined
      });

      const response: ApiResponse<V1MessageResponse> = await apiService.getMessages(
        pagination.limit,
        currentOffset,
        filters.source !== 'all' ? filters.source : undefined,
        filters.priority !== 'all' ? filters.priority : undefined,
        filters.context !== 'all' ? filters.context : undefined,
        searchQuery || undefined,
        filters.timeRange !== 'all' ? parseInt(filters.timeRange) : undefined
      );

      console.log('✅ API Response received:', response);

      // Store the full response for debugging
      setLastApiResponse(response);

      // Handle both wrapped and direct API responses
      let responseData;
      let isSuccess = false;

      if ((response as any).success !== undefined) {
        // Wrapped response format (expected)
        isSuccess = (response as any).success;
        responseData = (response as any).data;
      } else if ((response as any).messages && Array.isArray((response as any).messages)) {
        // Direct response format (actual from backend)
        isSuccess = true;
        responseData = response;
        // Update the stored response to show success
        setLastApiResponse({ success: true, data: response });
      }

      if (isSuccess && responseData) {
        const rawMessages = (responseData as any).messages || responseData || [];
        
        console.log(`📨 Received ${rawMessages.length} raw messages from API`);

        // Transform API messages to match our Message interface
        const transformedMessages = rawMessages.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.sender_domain || 'Unknown',
          subject: msg.subject_preview || 'No Subject',
          timestamp: msg.received_at || new Date().toISOString(),
          priority: mapApiPriorityToLocal(msg.predicted_priority),
          context: mapApiContextToLocal(msg.predicted_context),
          source: msg.source || 'unknown',
          isRead: msg.processed_at !== null, // Consider processed messages as read
          confidence: msg.prediction_confidence || 0,
          preview: msg.subject_preview || '',
          content: `Message from ${msg.sender_domain} - ${msg.subject_preview}`,
          attachments: []
        }));

        console.log(`🔄 Transformed ${transformedMessages.length} messages for UI`);

        if (loadMore) {
          setApiMessages(prev => [...prev, ...transformedMessages]);
        } else {
          setApiMessages(transformedMessages);
        }

        // Update pagination info from response
        const paginationData = (responseData as any).pagination || {
          limit: pagination.limit,
          offset: currentOffset,
          total: transformedMessages.length,
          has_more: false
        };

        setPagination({
          limit: paginationData.limit || pagination.limit,
          offset: currentOffset,
          total: paginationData.total || transformedMessages.length,
          hasNext: paginationData.has_more || false
        });

        // Update stats from all messages (API + context)
        const allCurrentMessages = loadMore ? [...apiMessages, ...transformedMessages] : transformedMessages;
        const newStats = {
          total: paginationData.total || allCurrentMessages.length,
          unread: allCurrentMessages.filter((m: Message) => !m.isRead).length,
          urgent: allCurrentMessages.filter((m: Message) => m.priority === 'very_urgent').length,
          important: allCurrentMessages.filter((m: Message) => m.priority === 'important').length
        };
        setStats(newStats);

        console.log('📊 Updated stats:', newStats);
        console.log('📄 Pagination info:', paginationData);
      } else {
        console.warn('⚠️ API response was not successful or has no data');
        console.warn('Response details:', response);
        
        // Clear messages on failed response
        setApiMessages([]);
        setPagination(prev => ({ ...prev, total: 0, hasNext: false }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      
      // Create error response object for debugging
      const errorResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : String(error),
        data: null
      };
      setLastApiResponse(errorResponse);
      
      // Show user-friendly error message
      setApiMessages([]);
      setPagination(prev => ({ ...prev, total: 0, hasNext: false }));
    } finally {
      setIsLoadingCustom(false);
    }
  };

  // Load more messages for pagination
  const loadMoreMessages = () => {
    if (pagination.hasNext && !isLoadingCustom) {
      getMessages(true);
    }
  };

  // Refresh messages
  const refreshMessages = async () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    await getMessages(false);
  };

  useEffect(() => {
    // Calculate stats from messages
    const newStats = {
      total: messages.length,
      unread: messages.filter(m => !m.isRead).length,
      urgent: messages.filter(m => m.priority === 'very_urgent').length,
      important: messages.filter(m => m.priority === 'important').length
    };
    setStats(newStats);
  }, [messages]);

  // Load messages on component mount
  useEffect(() => {
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload messages when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      getMessages();
    }, 500); // Debounce API calls

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery]);

  const handleMessageClick = (message: Message) => {
    console.log('Navigate to message:', message.id);
  };

  const handleMessageSelect = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filteredMessages.map(m => m.id)));
    }
  };

  const handleCorrectMessage = (message: Message) => {
    setSelectedMessage(message);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedback: {
    messageId: string;
    correctPriority: Priority;
    correctContext: Context;
    comments?: string;
  }) => {
    try {
      await submitFeedback(feedback.messageId, feedback.correctPriority, feedback.correctContext);
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleBulkAction = async (action: 'archive' | 'delete' | 'markRead') => {
    // Implement bulk actions
    console.log(`Performing ${action} on ${selectedMessages.size} messages`);
    setSelectedMessages(new Set());
  };

  // Handle individual message actions using API
  const handleMessageAction = async (messageId: string, action: 'delete' | 'markRead') => {
    try {
      if (action === 'delete') {
        await apiService.deleteMessage(messageId);
        // Remove from local state
        setApiMessages(prev => prev.filter(m => m.id !== messageId));
      } else if (action === 'markRead') {
        // This would need to be implemented in the API
        console.log(`Marking message ${messageId} as read`);
      }
      
      // Refresh stats
      await refreshMessages();
    } catch (error) {
      console.error(`Failed to ${action} message:`, error);
    }
  };

  // Combine messages from both sources (context and API)
  const allMessages = [...messages, ...apiMessages];
  
  const filteredMessages = allMessages.filter((message, index, self) => {
    // Remove duplicates based on message ID
    const isUnique = self.findIndex(m => m.id === message.id) === index;
    if (!isUnique) return false;

    if (searchQuery && !message.sender.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !message.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.source !== 'all' && message.source !== filters.source) return false;
    if (filters.context !== 'all' && message.context !== filters.context) return false;
    if (filters.priority !== 'all' && message.priority !== filters.priority) return false;
    if (filters.unreadOnly && message.isRead) return false;
    
    // Time range filter
    if (filters.timeRange !== 'all') {
      const daysAgo = parseInt(filters.timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      const messageDate = new Date(message.timestamp);
      if (messageDate < cutoffDate) return false;
    }
    
    return true;
  });

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'very_urgent': 3, 'important': 2, 'not_important': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'sender':
        return a.sender.localeCompare(b.sender);
      case 'date':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />

      <div className="lg:pl-72">
        <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header with Stats */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Mail className="h-8 w-8 text-blue-600 mr-3" />
                    Smart Inbox
                  </h1>
                  <p className="mt-2 text-gray-600">
                    AI-powered message management and prioritization
                  </p>
                  {apiMessages.length > 0 && (
                    <p className="mt-1 text-sm text-blue-600">
                      Showing {filteredMessages.length} messages • {apiMessages.length} from API • {messages.length} from context
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => getMessages(false)}
                    disabled={isLoadingMessages || isLoadingCustom}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoadingCustom ? (
                      <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    ) : (
                      <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    )}
                    {isLoadingCustom ? 'Refreshing...' : 'Refresh Messages'}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        console.log('📥 Fetching new messages from server...');
                        setIsLoadingCustom(true);
                        
                        // Trigger fetch for Gmail
                        const gmailResponse = await apiService.fetchGmailMessages();
                        console.log('✅ Gmail fetch response:', gmailResponse);
                        
                        // After fetch, refresh the messages list
                        await getMessages(false);
                        
                        setLastApiResponse({ 
                          success: true, 
                          message: 'Successfully fetched new messages from Gmail',
                          data: gmailResponse,
                          __test: 'fetch'
                        });
                      } catch (error) {
                        console.error('❌ Failed to fetch messages:', error);
                        setLastApiResponse({ 
                          success: false, 
                          error: error instanceof Error ? error.message : String(error),
                          message: 'Failed to fetch new messages',
                          __test: 'fetch'
                        });
                      } finally {
                        setIsLoadingCustom(false);
                      }
                    }}
                    disabled={isLoadingMessages || isLoadingCustom}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoadingCustom ? (
                      <Mail className="animate-pulse -ml-1 mr-2 h-4 w-4" />
                    ) : (
                      <Mail className="-ml-1 mr-2 h-4 w-4" />
                    )}
                    {isLoadingCustom ? 'Fetching...' : 'Fetch New Messages'}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        console.log('🔐 Testing auth...');
                        const authResponse = await apiService.getMe();
                        console.log('✅ Auth test result:', authResponse);
                        setLastApiResponse({ ...authResponse, __test: 'auth' });
                      } catch (error) {
                        console.error('❌ Auth test failed:', error);
                        setLastApiResponse({ 
                          success: false, 
                          error: error instanceof Error ? error.message : String(error),
                          __test: 'auth'
                        });
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Test Auth
                  </button>

                  <button
                    onClick={() => {
                      const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                      console.log('🌐 API Base URL:', apiBaseUrl);
                      console.log('🍪 Document cookies:', document.cookie);
                      console.log('💾 Local storage token:', localStorage.getItem('access_token'));
                      setLastApiResponse({ 
                        success: true, 
                        message: `API URL: ${apiBaseUrl}`, 
                        data: { 
                          apiUrl: apiBaseUrl,
                          hasCookies: document.cookie.length > 0,
                          hasToken: !!localStorage.getItem('access_token')
                        },
                        __test: 'debug'
                      });
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Debug Info
                  </button>

                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Unread</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Zap className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Urgent</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Important</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.important}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Enhanced Filters Sidebar */}
              <div className="xl:w-80 flex-shrink-0">
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <Filter className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Enhanced Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Messages
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by sender, subject..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Time Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Range
                      </label>
                      <select
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.timeRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                      >
                        <option value="1">Last 24 hours</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="all">All time</option>
                      </select>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source
                      </label>
                      <select
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.source}
                        onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                      >
                        <option value="all">All Sources</option>
                        <option value="gmail">Gmail</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>

                    {/* Context Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Context
                      </label>
                      <select
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.context}
                        onChange={(e) => setFilters(prev => ({ ...prev, context: e.target.value }))}
                      >
                        <option value="all">All Contexts</option>
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                        <option value="education">Education</option>
                        <option value="social">Social</option>
                        <option value="promotions">Promotions</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="all">All Priorities</option>
                        <option value="very_urgent">Very Urgent</option>
                        <option value="important">Important</option>
                        <option value="not_important">Not Important</option>
                      </select>
                    </div>

                    {/* Toggle Filters */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="unread-only"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={filters.unreadOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                        />
                        <label htmlFor="unread-only" className="ml-3 block text-sm text-gray-700">
                          Show unread only
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1">
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  {/* Enhanced Toolbar */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {selectedMessages.size > 0 && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedMessages.size === filteredMessages.length}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">
                              {selectedMessages.size} selected
                            </span>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleBulkAction('archive')}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleBulkAction('delete')}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Sort by:</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'sender')}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="date">Date</option>
                            <option value="priority">Priority</option>
                            <option value="sender">Sender</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode('compact')}
                            className={`p-1.5 rounded ${viewMode === 'compact' ? 'bg-white shadow-sm' : ''}`}
                            title="Compact view"
                          >
                            <div className="w-3 h-3 bg-current opacity-60"></div>
                          </button>
                          <button
                            onClick={() => setViewMode('comfortable')}
                            className={`p-1.5 rounded ${viewMode === 'comfortable' ? 'bg-white shadow-sm' : ''}`}
                            title="Comfortable view"
                          >
                            <div className="w-3 h-4 bg-current opacity-60"></div>
                          </button>
                          <button
                            onClick={() => setViewMode('spacious')}
                            className={`p-1.5 rounded ${viewMode === 'spacious' ? 'bg-white shadow-sm' : ''}`}
                            title="Spacious view"
                          >
                            <div className="w-3 h-5 bg-current opacity-60"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Content */}
                  <div className="min-h-96">
                    {(isLoadingMessages || isLoadingCustom) ? (
                      <div className="p-6">
                        <LoadingSkeleton type="list" count={5} />
                      </div>
                    ) : sortedMessages.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-gray-400 mb-4">
                          <Search className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No messages found</h3>
                        <p className="text-gray-500 mb-6">
                          {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== false && f !== '7') 
                            ? 'Try adjusting your filters or search query.' 
                            : 'Your inbox is empty. Try syncing messages.'}
                        </p>
                        
                        {/* Show API response info even when no messages match filters */}
                        {lastApiResponse && lastApiResponse.data?.messages?.length > 0 && (
                          <div className="mb-6 max-w-md mx-auto">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="text-sm text-yellow-800">
                                <strong>Note:</strong> API returned {lastApiResponse.data.messages.length} messages, 
                                but they were filtered out by your current filters.
                              </div>
                              <div className="mt-2 text-xs text-yellow-700">
                                Try adjusting your filters or search criteria to see more results.
                              </div>
                            </div>
                          </div>
                        )}

                        {!searchQuery && !Object.values(filters).some(f => f !== 'all' && f !== false && f !== '7') && (
                          <button
                            onClick={() => getMessages(false)}
                            disabled={isLoadingCustom}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isLoadingCustom ? (
                              <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            ) : (
                              <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
                            )}
                            {isLoadingCustom ? 'Refreshing...' : 'Refresh Messages'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Messages from API Response */}
                        <div className={`divide-y divide-gray-200 ${viewMode === 'spacious' ? 'space-y-2 p-2' : ''}`}>
                          {sortedMessages.map((message) => (
                            <div key={message.id} className={`${viewMode === 'spacious' ? 'rounded-lg border border-gray-200 overflow-hidden' : ''}`}>
                              <MessageCard
                                message={message}
                                onClick={handleMessageClick}
                                onCorrect={handleCorrectMessage}
                                viewMode={viewMode}
                                selected={selectedMessages.has(message.id)}
                                onSelect={() => handleMessageSelect(message.id)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* API Response Info Panel */}
                        {apiMessages.length > 0 && lastApiResponse && (
                          <div className="p-4 bg-blue-50 border-t border-blue-200">
                            <div className="space-y-3">
                              {/* Main Stats */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <span className="text-blue-700 font-medium">
                                    API Response: {apiMessages.length} messages transformed & loaded
                                  </span>
                                  <span className="text-blue-600">
                                    Total Available: {pagination.total}
                                  </span>
                                  <span className="text-blue-600">
                                    Current Offset: {pagination.offset}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-600">
                                    Page Limit: {pagination.limit}
                                  </span>
                                  {pagination.hasNext && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      More available
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* API Response Details */}
                              {lastApiResponse.data && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-gray-600 uppercase font-medium">Source</div>
                                    <div className="text-blue-700 font-semibold">
                                      {lastApiResponse.data.messages?.[0]?.source || 'Mixed'}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-gray-600 uppercase font-medium">API Version</div>
                                    <div className="text-blue-700 font-semibold">
                                      {lastApiResponse.data.api_version || 'v1'}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-gray-600 uppercase font-medium">Privacy</div>
                                    <div className="text-blue-700 font-semibold">
                                      {lastApiResponse.data.privacy_protected ? '🔒 Protected' : '🔓 Open'}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-gray-600 uppercase font-medium">Filters Applied</div>
                                    <div className="text-blue-700 font-semibold">
                                      {Object.values(lastApiResponse.data.filters || {}).filter(v => v !== null).length || 0}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Applied Filters Display */}
                              {lastApiResponse.data?.filters && (
                                <div className="text-xs">
                                  <span className="text-gray-600 font-medium">Active Filters: </span>
                                  <span className="text-blue-700">
                                    {Object.entries(lastApiResponse.data.filters)
                                      .filter(([, value]) => value !== null)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ') || 'None'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Load More Button */}
                        {pagination.hasNext && apiMessages.length > 0 && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <button
                              onClick={loadMoreMessages}
                              disabled={isLoadingCustom}
                              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {isLoadingCustom ? (
                                <>
                                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Loading more messages...
                                </>
                              ) : (
                                <>
                                  Load More Messages
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({pagination.total - sortedMessages.length} remaining)
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={selectedMessage}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Debug Panel - API Response (Development only) */}
      {process.env.NODE_ENV === 'development' && lastApiResponse && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">API Response Debug</h4>
            <button
              onClick={() => setLastApiResponse(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="text-xs space-y-1">
            <div>Success: {lastApiResponse.success ? '✅' : '❌'}</div>
            {lastApiResponse.__test && (
              <div className="text-cyan-300">Test: {lastApiResponse.__test}</div>
            )}
            <div>Messages: {lastApiResponse.data?.messages?.length || 0}</div>
            <div>Total: {lastApiResponse.data?.pagination?.total || 'N/A'}</div>
            <div>Has Next: {lastApiResponse.data?.pagination?.has_more ? '✅' : '❌'}</div>
            {lastApiResponse.message && (
              <div className="text-yellow-300">Message: {lastApiResponse.message}</div>
            )}
            {lastApiResponse.error && (
              <div className="text-red-300">Error: {lastApiResponse.error}</div>
            )}
            {!lastApiResponse.success && (
              <div className="text-red-300 mt-2">
                <div>Status: Failed</div>
                <div>Check console for details</div>
              </div>
            )}
          </div>
          <details className="mt-2">
            <summary className="text-xs cursor-pointer">Raw Response</summary>
            <pre className="text-xs mt-2 bg-gray-800 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(lastApiResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}