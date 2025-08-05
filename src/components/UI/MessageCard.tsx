import React from 'react';
import { Mail, MessageCircle, Clock, Edit3 } from 'lucide-react';
import PriorityTag, { Priority } from './PriorityTag';
import ContextTag, { Context } from './ContextTag';
import ConfidenceBar from './ConfidenceBar';

export interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  source: 'gmail' | 'whatsapp';
  priority: Priority;
  context: Context;
  confidence: number;
  isRead: boolean;
}

interface MessageCardProps {
  message: Message;
  onCorrect: (message: Message) => void;
  onClick: (message: Message) => void;
}

export default function MessageCard({ message, onCorrect, onClick }: MessageCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
        !message.isRead ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onClick(message)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {getInitials(message.sender)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-sm font-medium truncate ${
                !message.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {message.sender}
              </h3>
              <div className="flex items-center space-x-1">
                {message.source === 'gmail' ? (
                  <Mail className="w-4 h-4 text-gray-400" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-green-500" />
                )}
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>

            <p className={`text-sm mb-2 ${
              !message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'
            }`}>
              {message.subject}
            </p>

            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {message.preview}
            </p>

            {/* Tags and Confidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PriorityTag priority={message.priority} size="sm" />
                <ContextTag context={message.context} size="sm" />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-20">
                  <ConfidenceBar 
                    confidence={message.confidence} 
                    size="sm" 
                    showLabel={false} 
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {message.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCorrect(message);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Correct AI prediction"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}