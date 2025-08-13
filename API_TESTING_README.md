# API Endpoint Testing Suite

This comprehensive testing suite allows you to test all API endpoints from the unified `api.ts` service file.

## 📁 Files Created

1. **`src/tests/api-endpoints.test.ts`** - Main test suite class
2. **`src/tests/run-api-tests.ts`** - Test runner script
3. **`public/api-test.html`** - Standalone HTML test page
4. **`src/components/ApiTestingComponent.tsx`** - React component for testing

## 🚀 How to Use

### Option 1: HTML Test Page (Recommended for Quick Testing)

1. Open your browser and navigate to: `http://localhost:5173/api-test.html`
2. Enter your Gmail token in the configuration section
3. Click any test button to run specific endpoint categories
4. View real-time results and detailed reports

### Option 2: React Component

1. Add the component to any page in your React app:
```tsx
import ApiTestingComponent from '../components/ApiTestingComponent';

function TestPage() {
  return <ApiTestingComponent />;
}
```

### Option 3: Terminal/Script Testing

1. Open a terminal in the project directory
2. Run the test script:
```bash
npm run test:api
```

Or programmatically:
```typescript
import { runTests } from './src/tests/run-api-tests';

runTests().then(results => {
  console.log('Tests completed:', results);
});
```

## 🔧 Configuration

### Gmail Token Setup
To test Gmail-specific endpoints, you'll need a valid Gmail token:

1. **Get your Gmail token** from your browser's developer tools:
   - Open DevTools (F12)
   - Go to Network tab
   - Make a Gmail API request in your app
   - Find the request and copy the authorization token

2. **Paste the token** in the configuration section of any test interface

### API Base URL
The tests default to `http://localhost:8000`. Update this in:
- HTML page: Change the input field
- React component: The API service automatically uses your configured base URL
- Test scripts: Modify `TEST_CONFIG.API_BASE_URL`

## 📊 Test Categories

### 🔐 Authentication Tests
- `/auth/me` - Get current user
- `/auth/google` - Google OAuth URL
- `/auth/google/init` - Initialize Google auth
- `/auth/logout` - Logout user

### 📧 Gmail Tests
- `/api/v1/gmail/status` - Gmail connection status
- `/api/v1/gmail/connect` - Connect Gmail account
- `/api/v1/gmail/stats` - Gmail statistics
- `/api/v1/gmail/fetch` - Fetch Gmail messages
- `/api/v1/gmail/analytics` - Gmail analytics

### 📨 Message Processing Tests
- `/api/v1/messages/` - Get messages with filters
- `/api/v1/messages/processed` - Get processed messages
- `/api/v1/messages/fetch` - Fetch messages
- `/api/v1/messages/analytics` - Message analytics
- `/api/v1/messages/process` - Process message metadata

### 📊 Analytics Tests
- `/dashboard/stats` - Dashboard statistics
- `/api/v1/analytics/overview` - Analytics overview
- `/api/v1/analytics/dashboard` - Dashboard data
- `/api/v1/analytics/system` - System metrics
- `/api/v1/analytics/user/{id}` - User analytics

### 🤖 AI Prediction Tests
- `/api/v1/prediction/priority` - Predict message priority
- `/api/v1/prediction/feedback` - Submit prediction feedback

### 🧪 Debug/Testing Tests
- `/test/health` - Health check
- `/test/test-db` - Database test
- `/test/auth-check` - Authentication test
- `/test/gmail-diagnose` - Gmail diagnostics
- `/test/gmail-messages-live` - Live Gmail messages
- `/test/gmail-fetch` - Test Gmail fetch
- `/test/gmail-token-info` - Gmail token info

### ⚠️ Deprecated Methods Tests
- Legacy authentication methods
- Deprecated prediction methods
- Old analytics endpoints
- Token-based authentication (shows warnings)

## 📋 Test Results

Each test returns:
- **Status**: PASS, FAIL, or SKIP
- **Duration**: Response time in milliseconds
- **Message**: Success message or error details
- **Response**: API response data (for passed tests)
- **Error**: Error details (for failed tests)

## 🎯 Test Metrics

The suite provides comprehensive metrics:
- **Total Tests**: Number of tests executed
- **Passed**: Successfully completed tests
- **Failed**: Tests that encountered errors
- **Skipped**: Tests that require specific conditions
- **Success Rate**: Percentage of successful tests (excluding skipped)
- **Performance**: Average response time and slow test identification

## 🔍 Debugging

### Common Issues

1. **401 Unauthorized**: 
   - Ensure you're logged in to the app
   - Check if your session is valid
   - For Gmail tests, provide a valid Gmail token

2. **CORS Errors**:
   - Make sure your backend allows the frontend origin
   - Check if cookies are being sent properly

3. **Network Errors**:
   - Verify the API base URL is correct
   - Ensure the backend is running
   - Check firewall/proxy settings

4. **Timeout Errors**:
   - Some endpoints may be slow (normal for processing)
   - Increase timeout in `TEST_CONFIG.TIMEOUT`

### Debug Features

- **Real-time Logging**: See requests and responses as they happen
- **Detailed Error Messages**: Get specific error information
- **Performance Metrics**: Identify slow endpoints
- **Request Headers**: Debug authentication and headers
- **Response Data**: Inspect API responses

## 🚀 Quick Start

1. **Start your backend**: Make sure it's running on `http://localhost:8000`
2. **Start your frontend**: `npm run dev`
3. **Open test page**: Navigate to `http://localhost:5173/api-test.html`
4. **Add Gmail token**: (Optional) Paste your Gmail token for enhanced testing
5. **Run tests**: Click "🚀 Run All Tests" or choose specific categories
6. **Review results**: Check the summary and detailed results

## 📝 Notes

- **Safety**: Tests use real API endpoints but avoid destructive operations
- **Performance**: Some tests may be slow due to actual API processing
- **Authentication**: Tests respect your current login session
- **Gmail Token**: Only required for Gmail-specific endpoint testing
- **Skipped Tests**: Some tests require specific conditions (like valid message IDs)

## 🔧 Customization

You can extend the test suite by:
1. Adding new test categories in `api-endpoints.test.ts`
2. Modifying test configuration in `TEST_CONFIG`
3. Creating custom test runners for specific needs
4. Adding new endpoints as they're developed

Happy testing! 🧪✨
