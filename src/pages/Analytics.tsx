import React, { useState } from 'react';
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { useData } from '../context/DataContext';

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const { analytics, isLoadingAnalytics, fetchAnalytics } = useData();

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range);
    await fetchAnalytics(range);
  };

  // Use real data or fallback to mock data
  const contextData = analytics?.contextData || [
    { name: 'Business', value: 65, color: '#3B82F6' },
    { name: 'Personal', value: 35, color: '#10B981' },
  ];

  const priorityData = analytics?.priorityData || [
    { name: 'Jan', very_urgent: 12, important: 45, not_important: 78 },
    { name: 'Feb', very_urgent: 8, important: 52, not_important: 85 },
    { name: 'Mar', very_urgent: 15, important: 48, not_important: 92 },
    { name: 'Apr', very_urgent: 6, important: 38, not_important: 88 },
    { name: 'May', very_urgent: 18, important: 55, not_important: 95 },
    { name: 'Jun', very_urgent: 11, important: 42, not_important: 82 },
  ];

  const feedbackData = analytics?.feedbackData || [
    { name: 'Week 1', correct: 85, incorrect: 15 },
    { name: 'Week 2', correct: 88, incorrect: 12 },
    { name: 'Week 3', correct: 92, incorrect: 8 },
    { name: 'Week 4', correct: 89, incorrect: 11 },
  ];

  // Calculate stats from analytics data
  const stats = [
    {
      name: 'Accuracy Rate',
      value: analytics?.accuracyRate ? `${analytics.accuracyRate}%` : '89.2%',
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: TrendingUp,
    },
    {
      name: 'Total Predictions',
      value: analytics?.totalMessages?.toString() || '1,247',
      change: '+15%',
      changeType: 'increase' as const,
      icon: BarChart3,
    },
    {
      name: 'Feedback Received',
      value: '156',
      change: '+8%',
      changeType: 'increase' as const,
      icon: PieChartIcon,
    },
    {
      name: 'Avg Confidence',
      value: '87.4%',
      change: '+1.2%',
      changeType: 'increase' as const,
      icon: TrendingUp,
    },
  ];

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
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Insights into your message classification and AI performance.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateRange}
                      onChange={(e) => handleDateRangeChange(e.target.value)}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {isLoadingAnalytics ? (
              <LoadingSkeleton type="card" count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <item.icon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {item.name}
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">
                                {item.value}
                              </div>
                              <div
                                className={`ml-2 flex items-baseline text-sm font-semibold ${
                                  item.changeType === 'increase'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                <TrendingUp
                                  className={`self-center flex-shrink-0 h-4 w-4 ${
                                    item.changeType === 'increase'
                                      ? 'text-green-500'
                                      : 'text-red-500 rotate-180'
                                  }`}
                                />
                                <span className="sr-only">
                                  {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                                </span>
                                {item.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Context Distribution */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Context Distribution
                </h3>
                {isLoadingAnalytics ? (
                  <LoadingSkeleton type="chart" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contextData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contextData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Feedback Trends */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Feedback Trends
                </h3>
                {isLoadingAnalytics ? (
                  <LoadingSkeleton type="chart" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={feedbackData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="correct"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Correct Predictions"
                      />
                      <Line
                        type="monotone"
                        dataKey="incorrect"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Incorrect Predictions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Priority Messages Over Time */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Messages by Priority Over Time
              </h3>
              {isLoadingAnalytics ? (
                <LoadingSkeleton type="chart" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="very_urgent" stackId="a" fill="#EF4444" name="Very Urgent" />
                    <Bar dataKey="important" stackId="a" fill="#F59E0B" name="Important" />
                    <Bar dataKey="not_important" stackId="a" fill="#6B7280" name="Not Important" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}