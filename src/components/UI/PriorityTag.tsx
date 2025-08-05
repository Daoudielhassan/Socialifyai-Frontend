import React from 'react';
import { AlertTriangle, AlertCircle, Minus } from 'lucide-react';

export type Priority = 'very_urgent' | 'important' | 'not_important';

interface PriorityTagProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

const priorityConfig = {
  very_urgent: {
    label: 'Very Urgent',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
  },
  important: {
    label: 'Important',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
  },
  not_important: {
    label: 'Not Important',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Minus,
  },
};

export default function PriorityTag({ priority, size = 'md' }: PriorityTagProps) {
  const config = priorityConfig[priority] || priorityConfig['not_important']; // Fallback to 'not_important'
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}