import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Brain } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go back
          </button>
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}