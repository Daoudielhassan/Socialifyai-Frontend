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
  viewMode?: 'compact' | 'comfortable' | 'spacious';
  selected?: boolean;
  onSelect?: () => void;
}

export default function MessageCard({ 
  message, 
  onCorrect, 
  onClick, 
  viewMode = 'comfortable',
  selected = false,
  onSelect 
}: MessageCardProps) {
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

  const getPaddingClass = () => {
    switch (viewMode) {
      case 'compact': return 'p-3';
      case 'spacious': return 'p-6';
      default: return 'p-4';
    }
  };

  const getAvatarSize = () => {
    switch (viewMode) {
      case 'compact': return 'w-8 h-8';
      case 'spacious': return 'w-12 h-12';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
        !message.isRead ? 'border-l-4 border-l-blue-500' : ''
      } ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
        viewMode === 'spacious' ? 'rounded-lg' : ''
      } ${getPaddingClass()}`}
      onClick={() => onClick(message)}
    >
      <div className="flex items-start justify-between">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="flex-shrink-0 mr-3 pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        )}

        <div className="flex items-start space-x-3 flex-1">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center ${getAvatarSize()}`}>
              <span className={`font-medium text-white ${viewMode === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {getInitials(message.sender)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium truncate ${
                !message.isRead ? 'text-gray-900' : 'text-gray-700'
              } ${viewMode === 'compact' ? 'text-sm' : 'text-sm'}`}>
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

            <p className={`mb-2 ${
              !message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'
            } ${viewMode === 'compact' ? 'text-sm' : 'text-sm'}`}>
              {message.subject}
            </p>

            {viewMode !== 'compact' && (
              <p className={`text-gray-500 line-clamp-2 ${
                viewMode === 'spacious' ? 'mb-4 text-sm leading-relaxed' : 'mb-3 text-sm'
              }`}>
                {message.preview}
              </p>
            )}

            {/* Tags and Confidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PriorityTag priority={message.priority} size="sm" />
                <ContextTag context={message.context} size="sm" />
              </div>
              
              {viewMode !== 'compact' && (
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
              )}
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