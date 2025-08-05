import React from 'react';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';
import { useData } from '../context/DataContext';
import DevTools from './DevTools';

const IntegrationTestPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useOAuth2Auth();
  const { 
    messages, 
    analytics, 
    isLoadingMessages, 
    isLoadingAnalytics, 
    error, 
    fetchMessages, 
    fetchAnalytics,
    predictMessage,
    submitFeedback 
  } = useData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Integration Test Page
        </h1>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Logged In:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <>
                <p><strong>User Name:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Data Context Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Context Status</h2>
          <div className="space-y-2">
            <p><strong>Loading Messages:</strong> {isLoadingMessages ? '⏳ Yes' : '✅ No'}</p>
            <p><strong>Loading Analytics:</strong> {isLoadingAnalytics ? '⏳ Yes' : '✅ No'}</p>
            <p><strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}</p>
            <p><strong>Messages Count:</strong> {messages.length}</p>
            <p><strong>Analytics:</strong> {analytics ? '✅ Available' : '❌ Not loaded'}</p>
          </div>

          <div className="mt-4 space-x-4">
            <button
              onClick={() => fetchMessages()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoadingMessages}
            >
              Fetch Messages
            </button>
            <button
              onClick={() => fetchAnalytics('30d')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isLoadingAnalytics}
            >
              Fetch Analytics
            </button>
          </div>
        </div>

        {/* API Functions Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Functions Test</h2>
          <div className="space-x-4">
            <button
              onClick={() => predictMessage({
                sender: 'test@example.com',
                subject: 'Test Subject',
                content: 'This is a test message content.',
                source: 'gmail'
              })}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={isLoadingMessages}
            >
              Test AI Prediction
            </button>
            <button
              onClick={() => submitFeedback('test-message-id', 'urgent', 'business')}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              disabled={isLoadingMessages}
            >
              Test Submit Feedback
            </button>
          </div>
        </div>

        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
            <div className="space-y-3">
              {messages.slice(0, 5).map((message, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <p><strong>From:</strong> {message.sender}</p>
                  <p><strong>Subject:</strong> {message.subject}</p>
                  <p><strong>Content:</strong> {message.fullContent?.substring(0, 100) || message.preview}...</p>
                  <p><strong>Priority:</strong> {message.priority}</p>
                  <p><strong>Source:</strong> {message.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Display */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.totalMessages || 0}</p>
                <p className="text-gray-600">Total Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.urgentMessages || 0}</p>
                <p className="text-gray-600">Urgent Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.accuracyRate || 0}%</p>
                <p className="text-gray-600">AI Accuracy</p>
              </div>
            </div>
          </div>
        )}

        {/* DevTools */}
        <DevTools />
      </div>
    </div>
  );
};

export default IntegrationTestPage;
