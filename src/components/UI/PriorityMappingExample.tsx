import React, { useState } from 'react';
import api, { BackendPriority } from '../../services/api';
import { PriorityDisplay, PrioritySelector } from './PriorityComponents';
import { 
  getPriorityDisplayLabel, 
  getPriorityStats,
  sortMessagesByPriority 
} from '../../utils/priorityUtils';

// Example message type
interface ExampleMessage {
  id: number;
  subject: string;
  sender: string;
  priority: BackendPriority;
  timestamp: string;
}

/**
 * Example component demonstrating priority mapping usage
 */
export const PriorityMappingExample: React.FC = () => {
  // Example messages with backend priority format
  const [messages] = useState<ExampleMessage[]>([
    { id: 1, subject: 'Urgent: Server Down', sender: 'admin@company.com', priority: 'high', timestamp: '2025-08-13T10:00:00Z' },
    { id: 2, subject: 'Meeting Reminder', sender: 'calendar@company.com', priority: 'medium', timestamp: '2025-08-13T09:30:00Z' },
    { id: 3, subject: 'Newsletter', sender: 'newsletter@company.com', priority: 'low', timestamp: '2025-08-13T09:00:00Z' },
    { id: 4, subject: 'Critical Bug Report', sender: 'dev@company.com', priority: 'high', timestamp: '2025-08-13T08:45:00Z' },
  ]);

  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [feedbackPriority, setFeedbackPriority] = useState<BackendPriority | undefined>();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Sort messages by priority (urgent first)
  const sortedMessages = sortMessagesByPriority(messages, 'asc');
  
  // Get priority statistics
  const stats = getPriorityStats(messages);

  const handleSubmitFeedback = async () => {
    if (selectedMessageId && feedbackPriority) {
      try {
        await api.submitMessageFeedback(selectedMessageId, feedbackPriority);
        setFeedbackSubmitted(true);
        setTimeout(() => setFeedbackSubmitted(false), 3000);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Priority Mapping Example</h2>
      
      {/* Priority Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Message Priority Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-sm text-gray-600">Urgent ({stats.percentages.urgent}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.important}</div>
            <div className="text-sm text-gray-600">Important ({stats.percentages.important}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats['not important']}</div>
            <div className="text-sm text-gray-600">Not Important ({stats.percentages['not important']}%)</div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Messages (Sorted by Priority)</h3>
          <p className="text-sm text-gray-600">
            Backend uses: high/medium/low | Frontend displays: urgent/important/not important
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedMessages.map((message) => (
            <div 
              key={message.id} 
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedMessageId === message.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setSelectedMessageId(message.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{message.subject}</h4>
                    <PriorityDisplay priority={message.priority} />
                  </div>
                  <p className="text-sm text-gray-600">From: {message.sender}</p>
                  <p className="text-xs text-gray-500">
                    Backend: "{message.priority}" → Frontend: "{getPriorityDisplayLabel(message.priority)}"
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      {selectedMessageId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Submit Priority Feedback</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Message ID: {selectedMessageId}
              </label>
              <p className="text-sm text-gray-600">
                Current Priority: <PriorityDisplay priority={messages.find(m => m.id === selectedMessageId)?.priority || 'low'} />
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Priority (Frontend Labels, Backend Values):
              </label>
              <PrioritySelector 
                value={feedbackPriority ? getPriorityDisplayLabel(feedbackPriority) : undefined}
                onChange={setFeedbackPriority}
              />
              {feedbackPriority && (
                <p className="text-xs text-gray-500 mt-1">
                  Will send "{feedbackPriority}" to backend
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackPriority}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => {
                  setSelectedMessageId(null);
                  setFeedbackPriority(undefined);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            {feedbackSubmitted && (
              <div className="p-3 bg-green-100 border border-green-200 rounded-md text-green-800">
                ✅ Feedback submitted successfully!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Mapping Details</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backend Format:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• "high" - Most urgent</li>
                <li>• "medium" - Moderately important</li>
                <li>• "low" - Least important</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frontend Display:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• "urgent" - Needs immediate attention</li>
                <li>• "important" - Should be handled soon</li>
                <li>• "not important" - Can wait</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              <strong>Usage:</strong> All API calls use backend format ('high'/'medium'/'low'), 
              but UI components display user-friendly labels ('urgent'/'important'/'not important').
              The mapping utilities handle conversion automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityMappingExample;
