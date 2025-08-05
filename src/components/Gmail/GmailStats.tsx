import { useState, useEffect } from 'react';
import { useGmail } from '../../hooks/useGmail';

export const GmailStats = () => {
  const { stats, loadStats, loading, error, isConnected } = useGmail();
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    if (isConnected) {
      loadStats(timeRange);
    }
  }, [isConnected, timeRange]);

  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
    loadStats(days);
  };

  if (!isConnected) {
    return null;
  }

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Failed to load Gmail statistics</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Gmail Statistics</h3>
        <div className="flex space-x-1">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleTimeRangeChange(days)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Messages</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total_messages.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">Unread</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.unread_messages.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">High Priority</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.priority_breakdown.high.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Period</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.period_days} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Priority Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(stats.priority_breakdown).map(([priority, count]) => {
            const percentage = (count / stats.total_messages) * 100;
            const colors = {
              high: 'bg-red-500',
              medium: 'bg-yellow-500',
              low: 'bg-green-500'
            };
            
            return (
              <div key={priority} className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700 capitalize">
                  {priority}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
                  <div
                    className={`h-2 rounded-full ${colors[priority as 'high' | 'medium' | 'low']}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right ml-3">
                  {count.toLocaleString()} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Senders */}
      {stats.top_senders && stats.top_senders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Senders</h4>
          <div className="space-y-2">
            {stats.top_senders.slice(0, 5).map((sender, index) => (
              <div key={sender.domain} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-4">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">{sender.domain}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{sender.count} messages</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    sender.priority_avg === 'high' ? 'bg-red-100 text-red-800' :
                    sender.priority_avg === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {sender.priority_avg}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
