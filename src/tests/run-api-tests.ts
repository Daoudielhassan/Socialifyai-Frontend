// API Endpoint Test Runner
// Run this script to test all API endpoints

import ApiEndpointTester from './api-endpoints.test';

// Configuration
const GMAIL_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsImVtYWlsIjoiZGFvdWRpaGE2QGdtYWlsLmNvbSIsImV4cCI6MTc1NTM3MDUwNn0.ajqTgmdgNPlSCOlpqsHeiqhZYaA4kwlpOl07ZfKVMPI'; // Paste your Gmail token here

// Create and configure tester
const tester = new ApiEndpointTester(GMAIL_TOKEN);

// Test runner function
async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log('==================================\n');
  
  try {
    // Run all tests
    await tester.runAllTests();
    
    // Export results for further analysis
    const results = tester.exportResults();
    
    // Write results to console (you can save to file if needed)
    console.log('\n📄 DETAILED RESULTS:');
    console.log(results);
    
    // Summary
    const failedTests = tester.getFailedTests();
    const passedTests = tester.getPassedTests();
    
    console.log('\n🎯 QUICK SUMMARY:');
    console.log(`✅ Passed: ${passedTests.length}`);
    console.log(`❌ Failed: ${failedTests.length}`);
    
    if (failedTests.length > 0) {
      console.log('\n🔧 Failed Tests Details:');
      failedTests.forEach(test => {
        console.log(`   - ${test.endpoint} (${test.method}): ${test.message}`);
      });
    }
    
    return {
      passed: passedTests.length,
      failed: failedTests.length,
      results: tester.getResults()
    };
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    throw error;
  }
}

// Export for external use
export { runTests, tester };
export default runTests;

// Auto-run if this file is executed directly
if (require.main === module) {
  runTests()
    .then((summary) => {
      console.log(`\n✨ Test run completed: ${summary.passed} passed, ${summary.failed} failed`);
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

// =============================================================================
// QUICK TEST FUNCTIONS FOR SPECIFIC CATEGORIES
// =============================================================================

// Test only authentication endpoints
export async function testAuthOnly(): Promise<void> {
  console.log('🔐 Testing Authentication Endpoints Only...');
  const authTester = new ApiEndpointTester(GMAIL_TOKEN);
  await authTester.testAuthenticationEndpoints();
}

// Test only Gmail endpoints
export async function testGmailOnly(): Promise<void> {
  console.log('📧 Testing Gmail Endpoints Only...');
  const gmailTester = new ApiEndpointTester(GMAIL_TOKEN);
  await gmailTester.testGmailEndpoints();
}

// Test only message processing endpoints
export async function testMessagesOnly(): Promise<void> {
  console.log('📨 Testing Message Processing Endpoints Only...');
  const msgTester = new ApiEndpointTester(GMAIL_TOKEN);
  await msgTester.testMessageProcessingEndpoints();
}

// Test only analytics endpoints
export async function testAnalyticsOnly(): Promise<void> {
  console.log('📊 Testing Analytics Endpoints Only...');
  const analyticsTester = new ApiEndpointTester(GMAIL_TOKEN);
  await analyticsTester.testAnalyticsEndpoints();
}

// Test only debug/testing endpoints
export async function testDebugOnly(): Promise<void> {
  console.log('🧪 Testing Debug/Testing Endpoints Only...');
  const debugTester = new ApiEndpointTester(GMAIL_TOKEN);
  await debugTester.testTestingEndpoints();
}

// Quick health check
export async function quickHealthCheck(): Promise<boolean> {
  console.log('⚡ Quick Health Check...');
  const healthTester = new ApiEndpointTester(GMAIL_TOKEN);
  
  try {
    const healthResult = await (healthTester as any)['apiService'].testHealth();
    
    const authResult = await (healthTester as any)['apiService'].getMe();
    
    const isHealthy = healthResult.status === 'PASS' && authResult.status === 'PASS';
    console.log(`${isHealthy ? '✅' : '❌'} Health Check: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    
    return isHealthy;
  } catch (error) {
    console.log('❌ Health Check: FAILED');
    return false;
  }
}
