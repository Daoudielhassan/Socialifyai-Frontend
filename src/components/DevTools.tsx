import { useState, memo, useCallback, useMemo } from 'react';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';
import { useData } from '../context/DataContext';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'running' | 'skipped';
  data: any;
  timestamp: string;
}

const DevTools = memo(() => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { user } = useOAuth2Auth();
  const { fetchMessages, triggerMessageFetch, submitFeedback, predictMessage, fetchAnalytics } = useData();

  const addTestResult = (test: string, status: TestResult['status'], data: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runApiTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Check Authentication Status
      if (!user) {
        addTestResult('Auth Test', 'error', 'User not authenticated - please login with OAuth2');
      } else {
        addTestResult('Auth Test', 'success', `User authenticated: ${user.email}`);
      }

      // Test 2: Récupération des messages
      addTestResult('Fetch Messages', 'running', 'Fetching messages...');
      try {
        await fetchMessages();
        addTestResult('Fetch Messages', 'success', 'Messages fetched successfully');
      } catch (error: any) {
        addTestResult('Fetch Messages', 'error', error?.message || 'Unknown error');
      }

      // Test 3: Synchronisation des messages Gmail
      addTestResult('Gmail Sync', 'running', 'Syncing Gmail messages...');
      try {
        await triggerMessageFetch('gmail');
        addTestResult('Gmail Sync', 'success', 'Gmail sync completed');
      } catch (error: any) {
        addTestResult('Gmail Sync', 'error', error?.message || 'Unknown error');
      }

      // Test 4: Prédiction IA
      addTestResult('AI Prediction', 'running', 'Testing AI prediction...');
      try {
        const predictionResult = await predictMessage({
          sender: 'boss@company.com',
          subject: 'Urgent: Project deadline',
          content: 'We need to discuss the project deadline immediately. This is very important.',
          source: 'gmail'
        });
        addTestResult('AI Prediction', 'success', predictionResult);
      } catch (error: any) {
        addTestResult('AI Prediction', 'error', error?.message || 'Unknown error');
      }

      // Test 5: Soumission de feedback
      addTestResult('Submit Feedback', 'running', 'Testing feedback submission...');
      try {
        await submitFeedback('test-message-123', 'very_urgent', 'business');
        addTestResult('Submit Feedback', 'success', 'Feedback submitted successfully');
      } catch (error: any) {
        addTestResult('Submit Feedback', 'error', error?.message || 'Unknown error');
      }

      // Test 6: Analytics
      addTestResult('Fetch Analytics', 'running', 'Fetching analytics data...');
      try {
        await fetchAnalytics('30d');
        addTestResult('Fetch Analytics', 'success', 'Analytics data fetched');
      } catch (error: any) {
        addTestResult('Fetch Analytics', 'error', error?.message || 'Unknown error');
      }

    } catch (error: any) {
      addTestResult('General Error', 'error', error?.message || 'Unknown error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusColor = (status: TestResult['status']): string => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'running': return 'text-yellow-600 bg-yellow-50';
      case 'skipped': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']): string => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '⏳';
      case 'skipped': return '⏭️';
      default: return '📝';
    }
  };

  // Afficher uniquement en mode développement
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 w-96 max-h-96 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🛠️ Dev Tools</h3>
          <button
            onClick={runApiTests}
            disabled={isRunningTests}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningTests ? 'Testing...' : 'Test APIs'}
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className={`p-2 rounded text-sm ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {getStatusIcon(result.status)} {result.test}
                </span>
                <span className="text-xs">{result.timestamp}</span>
              </div>
              {typeof result.data === 'string' ? (
                <div className="mt-1 text-xs">{result.data}</div>
              ) : (
                <details className="mt-1">
                  <summary className="text-xs cursor-pointer">Details</summary>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {testResults.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              Click "Test APIs" to run integration tests
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          <div>User: {user ? `${user.full_name} (${user.email})` : 'Not logged in'}</div>
          <div>Environment: {process.env.NODE_ENV || 'development'}</div>
          <div>API URL: {import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8000'}</div>
        </div>
      </div>
    </div>
  );
});

DevTools.displayName = 'DevTools';

export default DevTools;
