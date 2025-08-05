import { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useOAuth2Auth } from '../../context/OAuth2AuthContext';

export const AnalyticsDashboard = () => {
  const { user } = useOAuth2Auth();
  const { analytics, loading, error, fetchUserAnalytics } = useAnalytics(user?.id ? user.id.toString() : null);
  const [timeRange, setTimeRange] = useState(30);

  const handleTimeRangeChange = async (days: number) => {
    setTimeRange(days);
    await fetchUserAnalytics({ days, includeTrends: true });
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium">Error Loading Analytics</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => fetchUserAnalytics({ days: timeRange, includeTrends: true })}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try Again →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Analytics Data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your Gmail account and let us analyze your messages to see insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Insights for {analytics.period?.start_date} - {analytics.period?.end_date}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleTimeRangeChange(days)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === days
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.message_stats.total_processed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.message_stats.daily_average.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Peak Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.message_stats.peak_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(analytics.message_stats.peak_day).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.priority_distribution.high * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.priority_distribution).map(([priority, percentage]) => {
              const colors = {
                high: { bg: 'bg-red-500', text: 'text-red-700' },
                medium: { bg: 'bg-yellow-500', text: 'text-yellow-700' },
                low: { bg: 'bg-green-500', text: 'text-green-700' }
              };
              
              return (
                <div key={priority} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                    {priority}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 ml-4">
                    <div
                      className={`h-3 rounded-full ${colors[priority as 'high' | 'medium' | 'low'].bg}`}
                      style={{ width: `${percentage * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-right ml-4">
                    {Math.round(percentage * 100)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Distribution based on AI prediction confidence</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                Confidence: 87%
              </span>
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Sources</h3>
          <div className="space-y-4">
            {Object.entries(analytics.source_breakdown).map(([source, count]) => {
              const percentage = (count / analytics.message_stats.total_processed) * 100;
              
              return (
                <div key={source} className="flex items-center">
                  <div className="flex items-center w-24">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      {source === 'gmail' ? (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 5.457v13.086c0 .958-.778 1.736-1.736 1.736H1.736A1.737 1.737 0 010 18.543V5.457c0-.958.778-1.736 1.736-1.736h20.528c.958 0 1.736.778 1.736 1.736z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{source}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 ml-4">
                    <div
                      className="h-3 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm font-semibold text-right ml-4">
                    {count.toLocaleString()} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trends & Insights */}
      {analytics.trends && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Trends & Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{analytics.trends.volume_trend}</p>
              <p className="text-sm text-gray-600">Volume Trend</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{analytics.trends.priority_trend}</p>
              <p className="text-sm text-gray-600">Priority Trend</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{analytics.trends.response_time_trend}</p>
              <p className="text-sm text-gray-600">Response Time</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Insights</h3>
          <div className="space-y-4">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {insight.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                        {insight.type}
                      </span>
                      <span className="text-xs text-blue-600">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
