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
import ApiService from '../services/api';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { messages, analytics, isLoadingMessages, isLoadingAnalytics, triggerMessageFetch } = useData();
  const { user } = useOAuth2Auth();

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const stats = await ApiService.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.warn('Failed to load dashboard stats, using mock data');
        // Keep mock data as fallback
      }
    };

    loadDashboardStats();
  }, []);

  // Calculate stats from current data
  const totalMessages = messages.length;
  const urgentMessages = messages.filter(msg => msg.priority === 'very_urgent').length;
  const todayMessages = messages.filter(msg => {
    const today = new Date().toDateString();
    const msgDate = new Date(msg.timestamp).toDateString();
    return today === msgDate;
  }).length;

  const stats = [
    {
      name: 'Total Messages',
      value: totalMessages.toString(),
      change: dashboardStats?.totalMessagesChange || '+12%',
      changeType: 'increase' as const,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      name: 'Urgent Messages',
      value: urgentMessages.toString(),
      change: dashboardStats?.urgentMessagesChange || '-8%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      name: 'Today\'s Messages',
      value: todayMessages.toString(),
      change: dashboardStats?.todayMessagesChange || '+24%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Active Connections',
      value: dashboardStats?.activeConnections?.toString() || '2',
      change: '0%',
      changeType: 'neutral' as const,
      icon: LinkIcon,
      color: 'bg-purple-500',
    },
  ];

  // Chart data from analytics or fallback to mock
  const chartData = analytics?.messageVolumeData || [
    { name: 'Mon', messages: 45 },
    { name: 'Tue', messages: 52 },
    { name: 'Wed', messages: 38 },
    { name: 'Thu', messages: 61 },
    { name: 'Fri', messages: 55 },
    { name: 'Sat', messages: 28 },
    { name: 'Sun', messages: 22 },
  ];

  const handleConnectService = (service: string) => {
    console.log(`Connecting to ${service}...`);
    // Implement connection logic
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        triggerMessageFetch('gmail'),
        triggerMessageFetch('whatsapp')
      ]);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = isLoadingMessages || isLoadingAnalytics;

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
                <h3 className="text-lg font-medium text-gray-900">Message Traffic This Week</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Messages
                  </div>
                </div>
              </div>
              {isLoading ? (
                <LoadingSkeleton type="chart" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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