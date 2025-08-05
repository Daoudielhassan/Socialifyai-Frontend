import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock, Edit3 } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import PriorityTag, { Priority } from '../components/UI/PriorityTag';
import ContextTag, { Context } from '../components/UI/ContextTag';
import ConfidenceBar from '../components/UI/ConfidenceBar';
import FeedbackModal from '../components/Modals/FeedbackModal';
import { Message } from '../components/UI/MessageCard';

// Mock message data - in real app, this would come from API
const mockMessage: Message = {
  id: '1',
  sender: 'Sarah Johnson',
  subject: 'Urgent: Project deadline moved up',
  preview: 'Hi team, I need to inform you that the client has requested to move up the project deadline to next Friday...',
  timestamp: '2024-01-15T10:30:00Z',
  source: 'gmail',
  priority: 'very_urgent',
  context: 'business',
  confidence: 92,
  isRead: true,
};

const fullContent = `Hi team,

I need to inform you that the client has requested to move up the project deadline to next Friday instead of the originally planned date of January 30th.

This means we need to:
1. Accelerate our development timeline
2. Prioritize the most critical features
3. Schedule additional team meetings this week
4. Possibly work some overtime to meet the new deadline

I understand this is short notice, but the client has offered a 15% bonus if we can deliver on time. Please let me know your availability for a team meeting tomorrow morning at 9 AM to discuss our action plan.

The key deliverables that must be completed by Friday are:
- User authentication system
- Core dashboard functionality  
- Payment integration
- Basic reporting features

Please reply with your thoughts and any concerns you might have about this accelerated timeline.

Best regards,
Sarah Johnson
Project Manager
TechCorp Solutions`;

export default function MessageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [message, setMessage] = useState<Message>(mockMessage);

  const handleBack = () => {
    navigate('/inbox');
  };

  const handleFeedbackSubmit = (feedback: {
    messageId: string;
    correctPriority: Priority;
    correctContext: Context;
    comments?: string;
  }) => {
    console.log('Feedback submitted:', feedback);
    // Update message with corrected values
    setMessage(prev => ({
      ...prev,
      priority: feedback.correctPriority,
      context: feedback.correctContext,
    }));
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />

      <div className="lg:pl-72">
        <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inbox
              </button>
              
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900">{message.subject}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-sm text-gray-600">From: {message.sender}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        {message.source === 'gmail' ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="capitalize">{message.source}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Correct AI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Message Content */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {fullContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">AI Insights</h3>
                  
                  <div className="space-y-6">
                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Classification
                      </label>
                      <PriorityTag priority={message.priority} size="lg" />
                    </div>

                    {/* Context */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Context Classification
                      </label>
                      <ContextTag context={message.context} size="lg" />
                    </div>

                    {/* Confidence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Confidence Score
                      </label>
                      <ConfidenceBar confidence={message.confidence} size="lg" />
                      <p className="text-sm text-gray-500 mt-2">
                        The AI is {message.confidence}% confident in this classification.
                      </p>
                    </div>

                    {/* Key Indicators */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Indicators
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Contains "Urgent" keyword</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Mentions deadline</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Work-related content</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Professional tone</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Was this classification correct?
                      </h4>
                      <div className="flex space-x-3">
                        <button className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          Yes, correct
                        </button>
                        <button
                          onClick={() => setFeedbackModalOpen(true)}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          No, incorrect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={message}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}