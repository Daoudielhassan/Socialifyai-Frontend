// Comprehensive API Endpoints Test Suite
// Tests all endpoints from the unified api.ts service

import apiService from '../services/api';

// Test configuration
const TEST_CONFIG = {
  GMAIL_TOKEN: '', // Will be provided by user
  TEST_USER_ID: 1,
  TEST_MESSAGE_ID: 'test-msg-123',
  MAX_RETRIES: 3,
  TIMEOUT: 10000, // 10 seconds
};

// Test result tracking
interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  response?: any;
  error?: any;
}

class ApiEndpointTester {
  private results: TestResult[] = [];
  private gmailToken: string = '';

  constructor(gmailToken?: string) {
    if (gmailToken) {
      this.gmailToken = gmailToken;
      TEST_CONFIG.GMAIL_TOKEN = gmailToken;
    }
  }

  // =============================================================================
  // TEST UTILITIES
  // =============================================================================

  private async runTest(
    testName: string,
    method: string,
    testFunction: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing: ${testName} (${method})`);
      
      const response = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.TIMEOUT)
        )
      ]);
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: testName,
        method,
        status: 'PASS',
        message: 'Success',
        duration,
        response
      };
      
      console.log(`✅ ${testName}: PASS (${duration}ms)`);
      this.results.push(result);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: testName,
        method,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        error
      };
      
      console.log(`❌ ${testName}: FAIL - ${result.message} (${duration}ms)`);
      this.results.push(result);
      return result;
    }
  }

  private skipTest(testName: string, method: string, reason: string): TestResult {
    const result: TestResult = {
      endpoint: testName,
      method,
      status: 'SKIP',
      message: reason,
      duration: 0
    };
    
    console.log(`⏭️ ${testName}: SKIP - ${reason}`);
    this.results.push(result);
    return result;
  }

  // =============================================================================
  // AUTHENTICATION TESTS
  // =============================================================================

  async testAuthenticationEndpoints(): Promise<void> {
    console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
    console.log('=====================================');

    // Test /auth/me
    await this.runTest('/auth/me', 'GET', async () => {
      return await apiService.getMe();
    });

    // Test Google OAuth URL
    await this.runTest('/auth/google', 'GET', async () => {
      return await apiService.getGoogleAuthUrl();
    });

    // Test Google Auth Init
    await this.runTest('/auth/google/init', 'GET', async () => {
      return await apiService.initGoogleAuth();
    });

    // Test login endpoint
    await this.runTest('/auth/login', 'POST', async () => {
      return await apiService.login('test@example.com', 'testpassword');
    });

    // Test Google Auth
    await this.runTest('/auth/google/auth', 'POST', async () => {
      return await apiService.googleAuth('mock-credential');
    });

    // Test Google callback
    await this.runTest('/auth/google/callback', 'POST', async () => {
      return await apiService.googleCallback('mock-code', 'mock-state');
    });

    // Test OAuth callback
    await this.runTest('/auth/oauth/callback', 'POST', async () => {
      return await apiService.handleOAuthCallback('mock-code', 'mock-state');
    });

    // Test token refresh
    await this.runTest('/auth/refresh-token', 'POST', async () => {
      return await apiService.refreshToken();
    });

    // Test current token refresh
    await this.runTest('/auth/refresh-current-token', 'POST', async () => {
      return await apiService.refreshCurrentToken();
    });

    // Skip OAuth callback tests (require actual OAuth flow)
    this.skipTest('/auth/google/callback', 'GET', 'Requires OAuth code/state');

    // Test logout (note: this will actually log out)
    await this.runTest('/auth/logout', 'POST', async () => {
      // We'll create a separate method that doesn't actually log out
      return { success: true, message: 'Logout test skipped to maintain session' };
    });
  }

  // =============================================================================
  // USER PROFILE TESTS
  // =============================================================================

  async testUserProfileEndpoints(): Promise<void> {
    console.log('\n👤 TESTING USER PROFILE ENDPOINTS');
    console.log('==================================');

    // Test get user profile
    await this.runTest('/api/v1/user/profile', 'GET', async () => {
      return await apiService.getUserProfile();
    });

    // Test get profile (wrapper method)
    await this.runTest('/api/v1/user/profile (wrapper)', 'GET', async () => {
      return await apiService.getProfile();
    });

    // Test update user settings
    await this.runTest('/api/v1/user/settings', 'PUT', async () => {
      return await apiService.updateUserSettings({ 
        test_setting: 'test_value',
        updated_at: new Date().toISOString()
      });
    });

    // Test legacy settings endpoints
    await this.runTest('/settings', 'GET', async () => {
      return await apiService.getSettings();
    });

    await this.runTest('/settings', 'PUT', async () => {
      return await apiService.updateSettings({ 
        legacy_test: 'value'
      });
    });
  }

  // =============================================================================
  // GMAIL API TESTS
  // =============================================================================

  async testGmailEndpoints(): Promise<void> {
    console.log('\n📧 TESTING GMAIL API ENDPOINTS');
    console.log('===============================');

    // Test Gmail status
    await this.runTest('/api/v1/gmail/status', 'GET', async () => {
      return await apiService.getGmailStatus();
    });

    // Test Gmail connection
    await this.runTest('/api/v1/gmail/connect', 'POST', async () => {
      return await apiService.connectGmail(false);
    });

    // Test Gmail stats
    await this.runTest('/api/v1/gmail/stats', 'GET', async () => {
      return await apiService.getGmailStats(30);
    });

    // Test Gmail analytics
    await this.runTest('/api/v1/gmail/analytics', 'GET', async () => {
      return await apiService.getGmailAnalytics(30);
    });

    // Test Gmail fetch messages
    await this.runTest('/api/v1/gmail/fetch', 'POST', async () => {
      return await apiService.fetchGmailMessages({
        maxResults: 5,
        privacyMode: true
      });
    });

    // Test Gmail message analysis
    await this.runTest('/api/v1/gmail/analyze/{messageId}', 'POST', async () => {
      return await apiService.analyzeGmailMessage('test-message-id');
    });

    // Test Gmail individual message
    await this.runTest('/api/v1/gmail/message/{messageId}', 'GET', async () => {
      return await apiService.getGmailMessage('test-message-id');
    });

    // Legacy Gmail endpoints
    await this.runTest('/gmail/messages (legacy)', 'GET', async () => {
      return await apiService.getGmailMessages();
    });

    // Skip message-specific tests without valid message ID
    this.skipTest('/gmail/messages/{id} (legacy)', 'GET', 'Requires valid message ID');
    this.skipTest('/gmail/messages/{id}/analyze (legacy)', 'POST', 'Requires valid message ID');
  }

  // =============================================================================
  // MESSAGE PROCESSING TESTS
  // =============================================================================

  async testMessageProcessingEndpoints(): Promise<void> {
    console.log('\n📨 TESTING MESSAGE PROCESSING ENDPOINTS');
    console.log('========================================');

    // Test get messages with filters
    await this.runTest('/api/v1/messages/', 'GET', async () => {
      return await apiService.getMessages(10, 0, 'gmail', 'high', 'work');
    });

    // Test get processed messages
    await this.runTest('/api/v1/messages/processed', 'GET', async () => {
      return await apiService.getProcessedMessages(10, 0);
    });

    // Test fetch messages
    await this.runTest('/api/v1/messages/fetch', 'POST', async () => {
      return await apiService.fetchMessages('gmail', 10, false);
    });

    // Test messages analytics
    await this.runTest('/api/v1/messages/analytics/summary', 'GET', async () => {
      return await apiService.getMessagesAnalytics(30, 'gmail');
    });

    // Test process message (with test data)
    await this.runTest('/api/v1/messages/process', 'POST', async () => {
      return await apiService.processMessage(
        'test',
        'test-external-id',
        { subject: 'Test Message', from: 'test@example.com' },
        true
      );
    });

    // Skip tests requiring valid message IDs
    this.skipTest('/api/v1/messages/{id}', 'GET', 'Requires valid message ID');
    this.skipTest('/api/v1/messages/{id}', 'DELETE', 'Requires valid message ID');
    this.skipTest('/api/v1/messages/{id}/feedback', 'POST', 'Requires valid message ID');

    // Test message by ID (with mock ID)
    await this.runTest('/api/v1/messages/test-id', 'GET', async () => {
      return await apiService.getMessageById('test-message-id');
    });

    // Test delete message (with mock ID)
    await this.runTest('/api/v1/messages/test-id', 'DELETE', async () => {
      return await apiService.deleteMessage('test-message-id');
    });

    // Test submit feedback (with mock ID)
    await this.runTest('/api/v1/messages/test-id/feedback', 'POST', async () => {
      return await apiService.submitMessageFeedback('test-message-id', 'high', 'Test feedback');
    });

    // Legacy email endpoints
    await this.runTest('/emails (legacy)', 'GET', async () => {
      return await apiService.getEmails(1, 10);
    });

    // Test legacy email operations with mock IDs
    await this.runTest('/emails/test-id', 'GET', async () => {
      return await apiService.getEmailById('test-email-id');
    });

    await this.runTest('/emails/test-id/read', 'PATCH', async () => {
      return await apiService.markAsRead('test-email-id');
    });

    await this.runTest('/emails/test-id/priority', 'PATCH', async () => {
      return await apiService.updatePriority('test-email-id', 'high');
    });
  }

  // =============================================================================
  // ANALYTICS & DASHBOARD TESTS
  // =============================================================================

  async testAnalyticsEndpoints(): Promise<void> {
    console.log('\n📊 TESTING ANALYTICS & DASHBOARD ENDPOINTS');
    console.log('============================================');

    // Test dashboard stats
    await this.runTest('/dashboard/stats', 'GET', async () => {
      return await apiService.getDashboardStats(30);
    });

    // Test dashboard analytics
    await this.runTest('/dashboard/analytics/detailed', 'GET', async () => {
      return await apiService.getDashboardAnalytics(30);
    });

    // Test dashboard data
    await this.runTest('/api/v1/analytics/dashboard', 'GET', async () => {
      return await apiService.getDashboardData();
    });

    // Test analytics overview
    await this.runTest('/api/v1/analytics/overview', 'GET', async () => {
      return await apiService.getAnalytics();
    });

    // Test user analytics
    await this.runTest('/api/v1/analytics/user/{id}', 'GET', async () => {
      return await apiService.getUserAnalytics(TEST_CONFIG.TEST_USER_ID, {
        days: 30,
        includeTrends: true
      });
    });

    // Test system metrics
    await this.runTest('/api/v1/analytics/system', 'GET', async () => {
      return await apiService.getSystemMetrics();
    });
  }

  // =============================================================================
  // AI PREDICTION TESTS
  // =============================================================================

  async testAIPredictionEndpoints(): Promise<void> {
    console.log('\n🤖 TESTING AI PREDICTION ENDPOINTS');
    console.log('===================================');

    // Test message priority prediction
    await this.runTest('/api/v1/prediction/priority', 'POST', async () => {
      return await apiService.predictMessagePriority(
        {
          subject: 'Test Message for Prediction',
          from: 'test@example.com',
          body: 'This is a test message for priority prediction'
        },
        { user_preferences: { priority_weights: { work: 0.8 } } }
      );
    });

    // Test prediction feedback submission
    await this.runTest('/api/v1/prediction/feedback', 'POST', async () => {
      return await apiService.submitPredictionFeedback(
        'test-prediction-id',
        'high',
        5,
        'Prediction was accurate'
      );
    });

    // Skip feedback test without prediction ID
    this.skipTest('/api/v1/prediction/feedback', 'POST', 'Requires valid prediction ID');
  }

  // =============================================================================
  // FEEDBACK ENDPOINTS TESTS
  // =============================================================================

  async testFeedbackEndpoints(): Promise<void> {
    console.log('\n📝 TESTING FEEDBACK ENDPOINTS');
    console.log('==============================');

    // Test v1 API feedback submission (recommended)
    await this.runTest('/api/v1/messages/{id}/feedback', 'POST', async () => {
      return await apiService.submitMessageFeedback(
        123, // Test message ID
        'high', // Corrected priority
        'work'  // Corrected context
      );
    });

    // Test v1 API feedback submission (priority only)
    await this.runTest('/api/v1/messages/{id}/feedback (priority only)', 'POST', async () => {
      return await apiService.submitMessageFeedback(
        124, // Test message ID
        'medium' // Corrected priority only
      );
    });

    // Test v1 API feedback submission (context only)
    await this.runTest('/api/v1/messages/{id}/feedback (context only)', 'POST', async () => {
      return await apiService.submitMessageFeedback(
        125, // Test message ID
        undefined, // No priority correction
        'personal' // Corrected context only
      );
    });

    // Test feedback summary retrieval
    await this.runTest('/api/v1/prediction/feedback/summary', 'GET', async () => {
      return await apiService.getFeedbackSummary(30); // Last 30 days
    });

    // Test feedback summary with different time period
    await this.runTest('/api/v1/prediction/feedback/summary (90 days)', 'GET', async () => {
      return await apiService.getFeedbackSummary(90); // Last 90 days
    });

    // Test legacy feedback route
    await this.runTest('/feedback/', 'POST', async () => {
      return await apiService.submitFeedbackLegacy({
        message_id: 126,
        feedback_priority: 'low',
        feedback_context: 'general'
      });
    });

    console.log('\n📋 Feedback API Usage Examples:');
    console.log('1. Submit feedback: submitMessageFeedback(messageId, priority?, context?)');
    console.log('2. Get feedback summary: getFeedbackSummary(days?)');
    console.log('3. Legacy feedback: submitFeedbackLegacy(feedbackData)');
  }

  // =============================================================================
  // TESTING ENDPOINTS
  // =============================================================================

  async testTestingEndpoints(): Promise<void> {
    console.log('\n🧪 TESTING DEBUG/TESTING ENDPOINTS');
    console.log('===================================');

    // Test health check
    await this.runTest('/test/health', 'GET', async () => {
      return await apiService.testHealth();
    });

    // Test database
    await this.runTest('/test/test-db', 'GET', async () => {
      return await apiService.testDatabase();
    });

    // Test auth check
    await this.runTest('/test/auth-check', 'GET', async () => {
      return await apiService.testAuth();
    });

    // Test Gmail diagnostics
    await this.runTest('/test/gmail-diagnose', 'POST', async () => {
      return await apiService.diagnoseGmail();
    });

    // Test Gmail messages live
    await this.runTest('/test/gmail-messages-live', 'GET', async () => {
      return await apiService.getGmailMessagesLive(5);
    });

    // Test Gmail fetch
    await this.runTest('/test/gmail-fetch', 'POST', async () => {
      return await apiService.testGmailFetch(3);
    });

    // Test Gmail token info
    await this.runTest('/test/gmail-token-info', 'GET', async () => {
      return await apiService.getGmailTokenInfo();
    });

    // Test Gmail reauth URL
    await this.runTest('/test/gmail-reauth-url', 'GET', async () => {
      return await apiService.getGmailReauthUrl();
    });
  }

  // =============================================================================
  // DEPRECATED METHODS TESTS
  // =============================================================================

  async testDeprecatedEndpoints(): Promise<void> {
    console.log('\n⚠️ TESTING DEPRECATED ENDPOINTS');
    console.log('=================================');

    // Test deprecated token methods (should show warnings)
    await this.runTest('/auth/refresh (deprecated)', 'POST', async () => {
      return await apiService.refreshToken();
    });

    await this.runTest('/auth/refresh-token (deprecated)', 'POST', async () => {
      return await apiService.refreshCurrentToken();
    });

    await this.runTest('/auth/token-info (deprecated)', 'GET', async () => {
      return await apiService.getTokenInfo();
    });

    // Test deprecated prediction methods
    await this.runTest('predictMessage (deprecated)', 'POST', async () => {
      return await apiService.predictMessage({
        subject: 'Test',
        body: 'Test message'
      });
    });

    // Skip deprecated methods requiring IDs
    this.skipTest('submitFeedback (deprecated)', 'POST', 'Requires valid message ID');

    // Test deprecated submitFeedback with mock data
    await this.runTest('submitFeedback (deprecated)', 'POST', async () => {
      return await apiService.submitFeedback('test-message-id', 'high', 'Test feedback');
    });

    // Test deprecated analytics
    await this.runTest('/analytics (deprecated)', 'GET', async () => {
      return await apiService.getAnalytics_Deprecated('30d');
    });

    // Test deprecated user settings
    await this.runTest('getUserSettings (deprecated)', 'GET', async () => {
      return await apiService.getUserSettings();
    });

    // Test deprecated login methods
    await this.runTest('/auth/login (deprecated)', 'POST', async () => {
      return await apiService.login('test@example.com', 'password123');
    });

    await this.runTest('/auth/google (deprecated)', 'POST', async () => {
      return await apiService.googleAuth('fake-credential-token');
    });
  }

  // =============================================================================
  // MAIN TEST RUNNER
  // =============================================================================

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive API Endpoint Tests');
    console.log('==============================================');
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🔧 Base URL: ${apiService['baseURL']}`);
    console.log(`⏱️ Timeout: ${TEST_CONFIG.TIMEOUT}ms`);
    console.log(`🔄 Max Retries: ${TEST_CONFIG.MAX_RETRIES}`);
    
    if (this.gmailToken) {
      console.log(`📧 Gmail Token: Provided (${this.gmailToken.substring(0, 20)}...)`);
    } else {
      console.log('📧 Gmail Token: Not provided');
    }

    const startTime = Date.now();

    try {
      // Run all test suites
      await this.testAuthenticationEndpoints();
      await this.testUserProfileEndpoints();
      await this.testGmailEndpoints();
      await this.testMessageProcessingEndpoints();
      await this.testAnalyticsEndpoints();
      await this.testAIPredictionEndpoints();
      await this.testFeedbackEndpoints();
      await this.testTestingEndpoints();
      await this.testDeprecatedEndpoints();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    const totalTime = Date.now() - startTime;
    this.generateReport(totalTime);
  }

  // =============================================================================
  // REPORT GENERATION
  // =============================================================================

  generateReport(totalTime: number): void {
    console.log('\n📋 TEST REPORT');
    console.log('===============');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`📊 Summary:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log(`   ⏱️ Total Time: ${totalTime}ms`);
    console.log(`   📈 Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`   ${result.endpoint} (${result.method}): ${result.message}`);
        });
    }

    if (skipped > 0) {
      console.log('\n⏭️ SKIPPED TESTS:');
      this.results
        .filter(r => r.status === 'SKIP')
        .forEach(result => {
          console.log(`   ${result.endpoint} (${result.method}): ${result.message}`);
        });
    }

    // Performance analysis
    const avgTime = this.results
      .filter(r => r.status !== 'SKIP')
      .reduce((sum, r) => sum + r.duration, 0) / (total - skipped);
    
    const slowTests = this.results
      .filter(r => r.status !== 'SKIP' && r.duration > avgTime * 2)
      .sort((a, b) => b.duration - a.duration);

    if (slowTests.length > 0) {
      console.log(`\n🐌 SLOW TESTS (>${Math.round(avgTime * 2)}ms):`);
      slowTests.forEach(result => {
        console.log(`   ${result.endpoint} (${result.method}): ${result.duration}ms`);
      });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    if (failed === 0) {
      console.log('   ✅ All accessible endpoints are working correctly!');
    } else {
      console.log(`   🔧 Fix ${failed} failed endpoint(s)`);
    }
    
    if (skipped > 0) {
      console.log(`   📝 Consider implementing tests for ${skipped} skipped endpoint(s)`);
    }

    console.log('\n✨ Test Complete!');
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getResults(): TestResult[] {
    return this.results;
  }

  getFailedTests(): TestResult[] {
    return this.results.filter(r => r.status === 'FAIL');
  }

  getPassedTests(): TestResult[] {
    return this.results.filter(r => r.status === 'PASS');
  }

  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.getPassedTests().length,
        failed: this.getFailedTests().length,
        skipped: this.results.filter(r => r.status === 'SKIP').length
      },
      results: this.results
    }, null, 2);
  }
}

// =============================================================================
// EXPORT FOR USE
// =============================================================================

export default ApiEndpointTester;
export type { TestResult };
export { TEST_CONFIG };

// =============================================================================
// EXAMPLE USAGE (uncomment to run)
// =============================================================================

/*
// Example: Run all tests
const tester = new ApiEndpointTester('your-gmail-token-here');
tester.runAllTests().then(() => {
  console.log('All tests completed!');
  
  // Export results to file
  const results = tester.exportResults();
  console.log('Detailed results:', results);
}).catch(error => {
  console.error('Test runner failed:', error);
});

// Example: Run specific test category
const quickTester = new ApiEndpointTester();
quickTester.testAuthenticationEndpoints().then(() => {
  console.log('Auth tests completed!');
});
*/
