import React from 'react';

interface ConfidenceBarProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ConfidenceBar({ 
  confidence, 
  size = 'md', 
  showLabel = true 
}: ConfidenceBarProps) {
  const getColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${getColor(confidence)}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
          {confidence}%
        </span>
      )}
    </div>
  );
}