import React from 'react';
import { Briefcase, User } from 'lucide-react';

export type Context = 'business' | 'personal';

interface ContextTagProps {
  context: Context;
  size?: 'sm' | 'md' | 'lg';
}

const contextConfig = {
  business: {
    label: 'Business',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
  },
  personal: {
    label: 'Personal',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: User,
  },
};

export default function ContextTag({ context, size = 'md' }: ContextTagProps) {
  const config = contextConfig[context] || contextConfig['business']; // Fallback to 'business'
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