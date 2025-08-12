import { useState, useEffect } from 'react';
import { 
  Mail, 
  Settings, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Shield,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Link,
  Inbox,
  Archive,
  Star,
  Send
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import apiService from '../services/api';

interface GmailStats {
  total_messages: number;
  unread_messages: number;
  connected: boolean;
  last_sync: string;
  sync_status: 'idle' | 'syncing' | 'error';
  priority_breakdown: {
    very_urgent: number;
    important: number;
    not_important: number;
  };
  recent_activity: Array<{
    type: string;
    count: number;
    timestamp: string;
  }>;
}

const GmailPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    loadGmailData();
  }, []);

  const loadGmailData = async () => {
    setIsLoading(true);
    try {
      // Load Gmail status and analytics in parallel
      const [statusResponse, analyticsResponse] = await Promise.all([
        apiService.getGmailStatus(),
        apiService.getGmailAnalytics(30)
      ]);

      if (statusResponse.data) {
        setStats(statusResponse.data);
        setConnectionStatus(statusResponse.data.connected ? 'connected' : 'disconnected');
      }

      // Analytics data will be used for future features
      if (analyticsResponse.data) {
        console.log('Analytics data loaded:', analyticsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load Gmail data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await apiService.fetchGmailMessages({ max_messages: 100, force_sync: true });
      await loadGmailData(); // Reload data after sync
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await apiService.connectGmail();
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
    }
  };

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Sidebar />
        <div className="lg:pl-72">
          <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <LoadingSkeleton type="list" count={3} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />

      <div className="lg:pl-72">
        <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Mail className="h-8 w-8 text-red-500 mr-3" />
                    Gmail Integration
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Connect and manage your Gmail with AI-powered insights
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {connectionStatus === 'connected' && (
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {isSyncing ? (
                        <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      ) : (
                        <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                      )}
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  )}

                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Connection Status Card */}
            <div className="mb-8">
              <div className={`rounded-xl border-2 overflow-hidden ${
                connectionStatus === 'connected' 
                  ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                  : connectionStatus === 'disconnected'
                  ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                  : 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-100' 
                          : connectionStatus === 'disconnected'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}>
                        {connectionStatus === 'connected' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : connectionStatus === 'disconnected' ? (
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className={`text-lg font-semibold ${
                          connectionStatus === 'connected' 
                            ? 'text-green-900' 
                            : connectionStatus === 'disconnected'
                            ? 'text-red-900'
                            : 'text-yellow-900'
                        }`}>
                          {connectionStatus === 'connected' 
                            ? 'Gmail Connected' 
                            : connectionStatus === 'disconnected'
                            ? 'Gmail Not Connected'
                            : 'Checking Connection...'}
                        </h3>
                        <p className={`text-sm ${
                          connectionStatus === 'connected' 
                            ? 'text-green-700' 
                            : connectionStatus === 'disconnected'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}>
                          {connectionStatus === 'connected' 
                            ? `Last synced: ${formatLastSync(stats?.last_sync || '')}`
                            : connectionStatus === 'disconnected'
                            ? 'Connect your Gmail account to start using AI-powered email management'
                            : 'Verifying your Gmail connection...'}
                        </p>
                      </div>
                    </div>

                    {connectionStatus === 'disconnected' && (
                      <button
                        onClick={handleConnect}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <Link className="-ml-1 mr-2 h-5 w-5" />
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {connectionStatus === 'connected' && stats && (
              <>
                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Inbox className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_messages?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Mail className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Unread</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.unread_messages?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Zap className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Urgent</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.priority_breakdown?.very_urgent || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Important</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.priority_breakdown?.important || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Priority Breakdown */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                          </div>
                          <span className="text-sm text-gray-500">Last 30 days</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-6">
                          {/* Very Urgent */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                              <span className="text-sm font-medium text-gray-900">Very Urgent</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{
                                    width: `${Math.min(100, (stats.priority_breakdown?.very_urgent / Math.max(stats.total_messages, 1)) * 100)}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 w-8">
                                {stats.priority_breakdown?.very_urgent || 0}
                              </span>
                            </div>
                          </div>

                          {/* Important */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                              <span className="text-sm font-medium text-gray-900">Important</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full" 
                                  style={{
                                    width: `${Math.min(100, (stats.priority_breakdown?.important / Math.max(stats.total_messages, 1)) * 100)}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 w-8">
                                {stats.priority_breakdown?.important || 0}
                              </span>
                            </div>
                          </div>

                          {/* Not Important */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                              <span className="text-sm font-medium text-gray-900">Not Important</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{
                                    width: `${Math.min(100, (stats.priority_breakdown?.not_important / Math.max(stats.total_messages, 1)) * 100)}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 w-8">
                                {stats.priority_breakdown?.not_important || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                    {/* Sync Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <Shield className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stats.sync_status === 'idle' ? 'bg-green-100 text-green-800' :
                            stats.sync_status === 'syncing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {stats.sync_status === 'idle' ? 'Up to date' :
                             stats.sync_status === 'syncing' ? 'Syncing...' :
                             'Error'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last sync</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatLastSync(stats.last_sync)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <Zap className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive old messages
                        </button>
                        
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Star className="h-4 w-4 mr-2" />
                          Star important emails
                        </button>
                        
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Send className="h-4 w-4 mr-2" />
                          Set up auto-replies
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {stats.recent_activity && stats.recent_activity.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          {stats.recent_activity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-900">
                                  {activity.count} {activity.type} processed
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatLastSync(activity.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GmailPage;
