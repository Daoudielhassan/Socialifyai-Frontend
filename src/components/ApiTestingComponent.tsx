import React, { useState, useRef } from 'react';
import ApiEndpointTester from '../tests/api-endpoints.test';
import apiService from '../services/api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  response?: any;
  error?: any;
}

const ApiTestingComponent: React.FC = () => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [gmailToken, setGmailToken] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Try to load Gmail token from localStorage on component mount
  React.useEffect(() => {
    const savedToken = localStorage.getItem('gmail_token');
    if (savedToken) {
      setGmailToken(savedToken);
      addLog(`📧 Gmail token loaded from localStorage (${savedToken.substring(0, 20)}...)`, 'success');
    }
  }, []);

  // Save Gmail token to localStorage when it changes
  const handleGmailTokenChange = (token: string) => {
    setGmailToken(token);
    if (token) {
      localStorage.setItem('gmail_token', token);
      addLog(`📧 Gmail token saved to localStorage`, 'success');
    } else {
      localStorage.removeItem('gmail_token');
    }
  };

  // Use the hardcoded token from the script for testing
  const useScriptToken = () => {
    const scriptToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsImVtYWlsIjoiZGFvdWRpaGE2QGdtYWlsLmNvbSIsImV4cCI6MTc1NTM3MDUwNn0.ajqTgmdgNPlSCOlpqsHeiqhZYaA4kwlpOl07ZfKVMPI';
    handleGmailTokenChange(scriptToken);
    addLog(`📧 Using Gmail token from test script`, 'info');
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    const logEntry = `[${timestamp}] ${icon} ${message}`;
    setLogs(prev => [...prev, logEntry]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    }, 100);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      addLog('🔍 Checking authentication status...', 'info');
      const response = await apiService.getMe();
      if (response.data) {
        setIsLoggedIn(true);
        setUserInfo(response.data);
        addLog(`✅ Authenticated as: ${response.data.email}`, 'success');
        return true;
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserInfo(null);
      addLog(`❌ Not authenticated: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return false;
    }
    return false;
  };

  // Navigate to login
  const goToLogin = () => {
    addLog('🔗 Redirecting to OAuth2 login...', 'info');
    window.location.href = '/oauth2-login';
  };

  // React.useEffect to check auth on mount
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const runTests = async (testType: 'all' | 'auth' | 'gmail' | 'messages' | 'analytics' | 'debug' | 'health') => {
    if (isTestRunning) return;

    setIsTestRunning(true);
    clearLogs();
    
    addLog('🚀 Starting API endpoint tests...', 'info');
    addLog(`📅 Test Date: ${new Date().toISOString()}`, 'info');
    addLog(`🔧 API URL: ${window.location.origin.replace(':5173', ':8000')}`, 'info');
    
    // Check authentication first (except for auth tests)
    if (testType !== 'auth') {
      const authOk = await checkAuthStatus();
      if (!authOk) {
        addLog('⚠️ Authentication required for most endpoints. Login first or run Auth Tests.', 'warning');
      }
    }
    
    if (gmailToken) {
      addLog(`📧 Gmail Token: Provided (${gmailToken.substring(0, 20)}...)`, 'info');
    } else {
      addLog('📧 Gmail Token: Not provided', 'warning');
    }

    try {
      // Create tester with the Gmail token from state
      const tester = new ApiEndpointTester(gmailToken || '');
      
      // Override console.log to capture logs from the tester
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        const message = args.join(' ');
        if (message.includes('🌐') || message.includes('✅') || message.includes('❌') || 
            message.includes('🔐') || message.includes('📧') || message.includes('📨') || 
            message.includes('📊') || message.includes('🧪') || message.includes('Testing:')) {
          addLog(message);
        }
        originalConsoleLog(...args);
      };

      try {
        switch (testType) {
          case 'all':
            await tester.runAllTests();
            break;
          case 'auth':
            await tester.testAuthenticationEndpoints();
            break;
          case 'gmail':
            await tester.testGmailEndpoints();
            break;
          case 'messages':
            await tester.testMessageProcessingEndpoints();
            break;
          case 'analytics':
            await tester.testAnalyticsEndpoints();
            break;
          case 'debug':
            await tester.testTestingEndpoints();
            break;
          case 'health':
            // Quick health check - just test a few key endpoints
            addLog('⚡ Running quick health check...', 'info');
            await tester.testTestingEndpoints();
            break;
        }

        const results = tester.getResults();
        setTestResults(results);

        const passed = results.filter(r => r.status === 'PASS').length;
        const failed = results.filter(r => r.status === 'FAIL').length;
        const skipped = results.filter(r => r.status === 'SKIP').length;

        addLog(`\n📋 TEST SUMMARY:`, 'info');
        addLog(`   Total Tests: ${results.length}`, 'info');
        addLog(`   ✅ Passed: ${passed}`, 'success');
        addLog(`   ❌ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
        addLog(`   ⏭️ Skipped: ${skipped}`, 'info');
        addLog(`   📈 Success Rate: ${((passed / (results.length - skipped)) * 100).toFixed(1)}%`, 'info');

        addLog('\n✨ Test run completed!', 'success');

      } finally {
        // Restore console.log
        console.log = originalConsoleLog;
      }

    } catch (error) {
      addLog(`❌ Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsTestRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'SKIP': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'SKIP': return '⏭️';
      default: return '❓';
    }
  };

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  const total = testResults.length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 API Endpoint Testing Suite</h1>
        <p className="text-gray-600">Comprehensive testing for all Socialify API endpoints</p>
      </div>

      {/* Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🔧 Configuration</h3>
        
        {/* Authentication Status */}
        <div className="mb-4 p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Authentication Status</h4>
              {isLoggedIn && userInfo ? (
                <p className="text-green-600">
                  ✅ Authenticated as: {userInfo.email} ({userInfo.auth_method})
                </p>
              ) : (
                <p className="text-red-600">
                  ❌ Not authenticated - Login required for most endpoints
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkAuthStatus}
                disabled={isTestRunning}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              {!isLoggedIn && (
                <button
                  onClick={goToLogin}
                  disabled={isTestRunning}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  🔗 Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gmail Token (Optional):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={gmailToken}
              onChange={(e) => handleGmailTokenChange(e.target.value)}
              placeholder="Paste your Gmail token here for enhanced testing..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTestRunning}
            />
            <button
              onClick={useScriptToken}
              disabled={isTestRunning}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Use the token from run-api-tests.ts"
            >
              📧 Use Script Token
            </button>
            {gmailToken && (
              <button
                onClick={() => handleGmailTokenChange('')}
                disabled={isTestRunning}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Clear Gmail token"
              >
                🗑️ Clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            📧 Providing a Gmail token will enable testing of Gmail-specific endpoints
          </p>
          {gmailToken && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Token provided: {gmailToken.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => runTests('all')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🚀 Run All Tests
          </button>
          <button
            onClick={() => runTests('health')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ⚡ Health Check
          </button>
          <button
            onClick={() => runTests('auth')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔐 Auth Tests
          </button>
          <button
            onClick={() => runTests('gmail')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📧 Gmail Tests
          </button>
          <button
            onClick={() => runTests('messages')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📨 Message Tests
          </button>
          <button
            onClick={() => runTests('analytics')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📊 Analytics Tests
          </button>
          <button
            onClick={() => runTests('debug')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🧪 Debug Tests
          </button>
          <button
            onClick={clearLogs}
            disabled={isTestRunning}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isTestRunning && (
        <div className="mb-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Running tests... Please wait</p>
        </div>
      )}

      {/* Results Summary */}
      {testResults.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-3">📊 Test Results Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{skipped}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {total > 0 ? ((passed / (total - skipped)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">📋 Detailed Results</h3>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Endpoint</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      <span className={getStatusColor(result.status)}>
                        {getStatusIcon(result.status)} {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{result.endpoint}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {result.method}
                      </span>
                    </td>
                    <td className="px-4 py-2">{result.duration}ms</td>
                    <td className="px-4 py-2 text-gray-600">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Console Output */}
      {logs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">📝 Console Output</h3>
          <div
            ref={outputRef}
            className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTestingComponent;
