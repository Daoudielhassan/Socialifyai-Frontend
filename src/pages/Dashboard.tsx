import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertTriangle, 
  Link as LinkIcon,
  TrendingUp,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw
} from '../utils/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '../utils/charts';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { useData } from '../context/DataContext';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const { messages, analytics, isLoadingMessages, isLoadingAnalytics, triggerMessageFetch } = useData();
  const { user } = useOAuth2Auth();

  // Load dashboard statistics and analytics
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        console.log('🔄 Loading dashboard data...');
        
        // Load both stats and analytics using direct API calls with Bearer token
        const token = localStorage.getItem('socialify_token') || sessionStorage.getItem('socialify_token') || sessionStorage.getItem('jwt_token');
        
        if (!token) {
          console.warn('⚠️ No authentication token found for dashboard API calls');
          throw new Error('Authentication token required');
        }

        const authHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const [statsResponse, analyticsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/dashboard/stats?days=30`, {
            credentials: 'include',
            headers: authHeaders
          }).then(res => res.json()),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/dashboard/analytics/detailed?days=30`, {
            credentials: 'include',
            headers: authHeaders
          }).then(res => res.json())
        ]);

        console.log('📊 Dashboard stats response:', statsResponse);
        console.log('📈 Dashboard analytics response:', analyticsResponse);

        setDashboardStats(statsResponse);
        setDashboardAnalytics(analyticsResponse);
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        // Keep existing mock data as fallback
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate stats from API response or fallback to message data
  const totalMessages = dashboardStats?.overview?.total_messages || messages.length;
  const todayMessages = dashboardStats?.overview?.messages_today || messages.filter(msg => {
    const today = new Date().toDateString();
    const msgDate = new Date(msg.timestamp).toDateString();
    return today === msgDate;
  }).length;
  const weekMessages = dashboardStats?.overview?.messages_this_week || messages.filter(msg => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(msg.timestamp) >= weekAgo;
  }).length;
  
  // Calculate urgent messages from priority distribution or message data
  const urgentMessages = dashboardStats?.analytics?.priority_distribution?.high || 
    dashboardStats?.analytics?.priority_distribution?.very_urgent ||
    messages.filter(msg => msg.priority === 'very_urgent' || msg.priority === 'important').length;

  // Calculate trend percentage
  const weekTrendPercentage = dashboardStats?.overview?.week_trend_percentage || 0;
  const formatTrendPercentage = (value: number) => {
    if (value === 0) return '0%';
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  const stats = [
    {
      name: 'Total Messages',
      value: totalMessages.toString(),
      change: formatTrendPercentage(weekTrendPercentage),
      changeType: weekTrendPercentage > 0 ? 'increase' as const : 
                  weekTrendPercentage < 0 ? 'decrease' as const : 'neutral' as const,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      name: 'Urgent Messages',
      value: urgentMessages.toString(),
      change: dashboardStats?.analytics?.urgent_trend || '-8%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      name: 'Today\'s Messages',
      value: todayMessages.toString(),
      change: dashboardStats?.analytics?.today_trend || '+24%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'This Week',
      value: weekMessages.toString(),
      change: formatTrendPercentage(weekTrendPercentage),
      changeType: weekTrendPercentage > 0 ? 'increase' as const : 
                  weekTrendPercentage < 0 ? 'decrease' as const : 'neutral' as const,
      icon: LinkIcon,
      color: 'bg-purple-500',
    },
  ];

  // Chart data from analytics API or fallback to mock
  const getChartData = () => {
    // Try to get data from dashboard analytics API first
    if (dashboardAnalytics?.analytics?.daily_volumes) {
      // Convert API data to chart format
      return dashboardAnalytics.analytics.daily_volumes.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString('en', { weekday: 'short' }),
        messages: item.count || 0
      }));
    }
    
    // Try to get data from existing analytics context
    if (analytics?.messageVolumeData) {
      return analytics.messageVolumeData;
    }
    
    // Fallback: Generate realistic data based on actual message count
    const totalMessages = messages.length;
    const avgDaily = Math.max(1, Math.floor(totalMessages / 7));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days.map(day => ({
      name: day,
      messages: Math.max(0, avgDaily + Math.floor(Math.random() * 10 - 5)) // Random variation ±5
    }));
  };

  const chartData = getChartData();

  const handleConnectService = (service: string) => {
    console.log(`Connecting to ${service}...`);
    // Implement connection logic
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing dashboard data...');
      
      // Get Bearer token for authentication
      const token = localStorage.getItem('socialify_token') || sessionStorage.getItem('socialify_token') || sessionStorage.getItem('jwt_token');
      
      if (!token) {
        console.warn('⚠️ No authentication token found for dashboard refresh');
        throw new Error('Authentication token required');
      }

      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Refresh both dashboard data and messages
      const [statsResponse, analyticsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/dashboard/stats?days=30`, {
          credentials: 'include',
          headers: authHeaders
        }).then(res => res.json()),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/dashboard/analytics/detailed?days=30`, {
          credentials: 'include',
          headers: authHeaders
        }).then(res => res.json()),
        triggerMessageFetch('gmail'),
        triggerMessageFetch('whatsapp')
      ]);

      setDashboardStats(statsResponse);
      setDashboardAnalytics(analyticsResponse);
      
      console.log('✅ Dashboard refresh completed');
    } catch (error) {
      console.error('❌ Failed to refresh dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = isLoadingMessages || isLoadingAnalytics || isLoadingStats;

  return (
    <div>
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />

      <div className="lg:pl-72">
        <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.full_name || 'User'}!
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Here's what's happening with your messages today.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {/* Debug Panel - Development Only */}
              {import.meta.env.DEV && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">🔍 Dashboard API Debug</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <strong>Stats API:</strong> {dashboardStats ? '✅ Loaded' : '❌ No Data'}
                      {dashboardStats && (
                        <div className="mt-1 text-gray-600">
                          Total: {dashboardStats.overview?.total_messages || 'N/A'} | 
                          Today: {dashboardStats.overview?.messages_today || 'N/A'} |
                          Week: {dashboardStats.overview?.messages_this_week || 'N/A'}
                        </div>
                      )}
                    </div>
                    <div>
                      <strong>Analytics API:</strong> {dashboardAnalytics ? '✅ Loaded' : '❌ No Data'}
                      {dashboardAnalytics && (
                        <div className="mt-1 text-gray-600">
                          Period: {dashboardAnalytics.period?.days || 'N/A'} days |
                          Messages: {dashboardAnalytics.analytics?.total_messages || 'N/A'}
                        </div>
                      )}
                    </div>
                    <div>
                      <strong>Chart Data:</strong> {chartData.length} points
                      <div className="mt-1 text-gray-600">
                        Source: {dashboardAnalytics?.analytics?.daily_volumes ? 'API' : 
                                analytics?.messageVolumeData ? 'Context' : 'Generated'} |
                        Total: {chartData.reduce((sum: number, item: any) => sum + item.messages, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {isLoading ? (
              <LoadingSkeleton type="card" count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((item) => (
                  <div
                    key={item.name}
                    className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                  >
                    <dt>
                      <div className={`absolute ${item.color} rounded-md p-3`}>
                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                    </dt>
                    <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                      <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                      <p
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'increase'
                            ? 'text-green-600'
                            : item.changeType === 'decrease'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {item.changeType === 'increase' && (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        )}
                        {item.changeType === 'decrease' && (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-red-500 rotate-180" />
                        )}
                        <span className="sr-only">
                          {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                      </p>
                    </dd>
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Message Traffic This Week</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardAnalytics ? 
                      `Data from last ${dashboardAnalytics.period?.days || 30} days` : 
                      'Sample data (connect to see real analytics)'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Messages
                  </div>
                  {dashboardAnalytics && (
                    <div className="text-xs text-gray-400">
                      Total: {dashboardAnalytics.analytics?.total_messages || 'N/A'}
                    </div>
                  )}
                </div>
              </div>
              {isLoading ? (
                <LoadingSkeleton type="chart" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`${value} messages`, 'Messages']}
                        labelFormatter={(label: any) => `${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1D4ED8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Chart Summary */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Average: {Math.round(chartData.reduce((sum: number, item: any) => sum + item.messages, 0) / chartData.length)} messages/day
                    </div>
                    <div>
                      Peak: {Math.max(...chartData.map((item: any) => item.messages))} messages
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Connection Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Gmail Connection */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Gmail</dt>
                      <dd className="text-lg font-medium text-gray-900">Connected</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last sync: 2 minutes ago</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Connection */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">WhatsApp</dt>
                      <dd className="text-lg font-medium text-gray-900">Not Connected</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleConnectService('whatsapp')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Connect WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}