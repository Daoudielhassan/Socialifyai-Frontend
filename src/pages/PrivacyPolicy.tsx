import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Server, AlertTriangle } from '../utils/icons';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy-First Approach
          </h1>
          <p className="text-xl text-gray-600">
            How Socialify protects your privacy and keeps your data secure
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">No Content Access</h3>
            </div>
            <p className="text-gray-600">
              We never read, store, or access your actual email content. Only metadata like sender domains and timestamps are processed.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Server className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Memory-Only Processing</h3>
            </div>
            <p className="text-gray-600">
              All processing happens in memory using serverless functions. No data is stored on our servers after processing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Secure Authentication</h3>
            </div>
            <p className="text-gray-600">
              OAuth2 with Google ensures secure, encrypted authentication. We never store passwords or personal credentials.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
                <div className="w-6 h-6 mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Data Hashing</h3>
              </div>
            <p className="text-gray-600">
              Sensitive information like email subjects are hashed before processing, ensuring they can't be reverse-engineered.
            </p>
          </div>
        </div>

        {/* Detailed Privacy Policy */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do and Don't Access</h2>
          
          {/* What We Access */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              What We Access (Read-Only)
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Sender domains:</strong> Only the domain part of email addresses (e.g., "company.com" not "john@company.com")</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Message timestamps:</strong> When emails were received</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Gmail labels:</strong> System labels like INBOX, IMPORTANT (not custom labels)</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Message IDs:</strong> Gmail's internal message identifiers</span>
              </li>
            </ul>
          </div>

          {/* What We Don't Access */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              What We Never Access
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Email content/body:</strong> The actual text or HTML content of your emails</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Full email addresses:</strong> Only domains, never complete addresses</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Attachments:</strong> No access to files or documents</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Personal information:</strong> Names, phone numbers, addresses in emails</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Send capabilities:</strong> We can't send emails or modify your account</span>
              </li>
            </ul>
          </div>

          {/* How We Process Data */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">How We Process Your Data</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </span>
                <div>
                  <strong>Serverless Processing:</strong> Your data is processed using temporary serverless functions that automatically destroy all data after processing.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </span>
                <div>
                  <strong>In-Memory Only:</strong> All processing happens in memory. No temporary files or caches are created.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </span>
                <div>
                  <strong>Privacy Filters:</strong> All logs and debugging information are filtered to remove any sensitive data.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </span>
                <div>
                  <strong>Hashing:</strong> Sensitive metadata like subject lines are hashed before any AI processing.
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention Policy</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2">
                <strong>Authentication tokens:</strong> Stored securely in your browser session only
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Processing results:</strong> Stored temporarily in your browser for the current session
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Server-side data:</strong> Zero data retention. All processing is ephemeral
              </p>
              <p className="text-gray-600">
                <strong>Analytics:</strong> Only aggregated, anonymized usage statistics (no personal data)
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Security Note
              </h3>
              <p className="text-yellow-700 text-sm">
                If you ever have concerns about your data privacy or security, you can revoke Socialify's access 
                to your Gmail account at any time through your{' '}
                <a 
                  href="https://myaccount.google.com/permissions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Google Account permissions page
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
