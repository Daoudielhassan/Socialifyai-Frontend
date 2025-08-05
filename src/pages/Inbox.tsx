import React, { useState } from 'react';
import { Filter, Plus, Search } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import MessageCard, { Message } from '../components/UI/MessageCard';
import FeedbackModal from '../components/Modals/FeedbackModal';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { Priority } from '../components/UI/PriorityTag';
import { Context } from '../components/UI/ContextTag';
import { useData } from '../context/DataContext';

// Mock data
const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'Sarah Johnson',
    subject: 'Urgent: Project deadline moved up',
    preview: 'Hi team, I need to inform you that the client has requested to move up the project deadline to next Friday...',
    timestamp: '2024-01-15T10:30:00Z',
    source: 'gmail',
    priority: 'very_urgent',
    context: 'business',
    confidence: 92,
    isRead: false,
  },
  {
    id: '2',
    sender: 'Mom',
    subject: 'Family dinner this Sunday',
    preview: 'Don\'t forget about our family dinner this Sunday at 6 PM. Your aunt will be visiting from out of town...',
    timestamp: '2024-01-15T09:15:00Z',
    source: 'whatsapp',
    priority: 'important',
    context: 'personal',
    confidence: 88,
    isRead: false,
  },
  {
    id: '3',
    sender: 'Netflix',
    subject: 'New shows added to your list',
    preview: 'Check out the latest additions to Netflix including the new season of your favorite series...',
    timestamp: '2024-01-15T08:45:00Z',
    source: 'gmail',
    priority: 'not_important',
    context: 'personal',
    confidence: 95,
    isRead: true,
  },
  {
    id: '4',
    sender: 'John Smith',
    subject: 'Meeting notes from today',
    preview: 'Here are the meeting notes from our discussion today. Please review and let me know if I missed anything...',
    timestamp: '2024-01-14T16:20:00Z',
    source: 'gmail',
    priority: 'important',
    context: 'business',
    confidence: 78,
    isRead: true,
  },
];

export default function Inbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    source: 'all',
    context: 'all',
    priority: 'all',
    unreadOnly: false,
  });

  const { messages, isLoadingMessages, submitFeedback, triggerMessageFetch } = useData();

  const handleMessageClick = (message: Message) => {
    // Mark as read locally (you might want to send this to the backend too)
    // Navigate to message details (would use router in real app)
    console.log('Navigate to message:', message.id);
  };

  const handleCorrectMessage = (message: Message) => {
    setSelectedMessage(message);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedback: {
    messageId: string;
    correctPriority: Priority;
    correctContext: Context;
    comments?: string;
  }) => {
    try {
      await submitFeedback(feedback.messageId, feedback.correctPriority, feedback.correctContext);
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleNewFetch = async () => {
    try {
      await triggerMessageFetch('gmail');
    } catch (error) {
      console.error('Failed to fetch new messages:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (searchQuery && !message.sender.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !message.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.source !== 'all' && message.source !== filters.source) return false;
    if (filters.context !== 'all' && message.context !== filters.context) return false;
    if (filters.priority !== 'all' && message.priority !== filters.priority) return false;
    if (filters.unreadOnly && message.isRead) return false;
    return true;
  });

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {filteredMessages.length} messages • {filteredMessages.filter(m => !m.isRead).length} unread
                  </p>
                </div>
                <button
                  onClick={handleNewFetch}
                  disabled={isLoadingMessages}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  New Fetch
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source
                      </label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.source}
                        onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                      >
                        <option value="all">All Sources</option>
                        <option value="gmail">Gmail</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>

                    {/* Context Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Context
                      </label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.context}
                        onChange={(e) => setFilters(prev => ({ ...prev, context: e.target.value }))}
                      >
                        <option value="all">All Contexts</option>
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="all">All Priorities</option>
                        <option value="very_urgent">Very Urgent</option>
                        <option value="important">Important</option>
                        <option value="not_important">Not Important</option>
                      </select>
                    </div>

                    {/* Unread Only */}
                    <div className="flex items-center">
                      <input
                        id="unread-only"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={filters.unreadOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                      />
                      <label htmlFor="unread-only" className="ml-2 block text-sm text-gray-700">
                        Unread only
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1">
                {isLoadingMessages ? (
                  <LoadingSkeleton type="list" count={5} />
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                      </div>
                    ) : (
                      filteredMessages.map((message) => (
                        <MessageCard
                          key={message.id}
                          message={message}
                          onClick={handleMessageClick}
                          onCorrect={handleCorrectMessage}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={selectedMessage}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}