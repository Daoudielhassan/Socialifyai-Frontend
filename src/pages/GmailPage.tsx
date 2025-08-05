import React from 'react';
import { GmailConnect } from '../components/Gmail/GmailConnect';
import { MessageList } from '../components/Gmail/MessageList';
import { GmailStats } from '../components/Gmail/GmailStats';

const GmailPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gmail Integration</h1>
        <p className="mt-2 text-lg text-gray-600">
          Connect and analyze your Gmail messages with AI-powered insights
        </p>
      </div>

      <div className="space-y-8">
        {/* Gmail Connection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GmailConnect />
          </div>
          <div>
            <GmailStats />
          </div>
        </div>

        {/* Messages List */}
        <MessageList />
      </div>
    </div>
  );
};

export default GmailPage;
