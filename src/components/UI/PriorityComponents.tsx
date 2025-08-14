import React from 'react';
import { BackendPriority, FrontendPriority } from '../../services/api';
import { 
  getPriorityDisplayLabel, 
  convertPriorityToBackend, 
  getPriorityStyle, 
  getPriorityIcon,
  getPriorityOptions 
} from '../../utils/priorityUtils';

interface PriorityDisplayProps {
  priority: BackendPriority;
  showIcon?: boolean;
  className?: string;
}

/**
 * Component to display priority with proper mapping
 */
export const PriorityDisplay: React.FC<PriorityDisplayProps> = ({ 
  priority, 
  showIcon = true, 
  className = '' 
}) => {
  const displayLabel = getPriorityDisplayLabel(priority);
  const styleClasses = getPriorityStyle(priority);
  const icon = getPriorityIcon(priority);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styleClasses} ${className}`}>
      {showIcon && <span className="mr-1">{icon}</span>}
      {displayLabel}
    </span>
  );
};

interface PrioritySelectorProps {
  value?: FrontendPriority;
  onChange: (priority: BackendPriority) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Component for selecting priority with frontend labels but backend values
 */
export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const options = getPriorityOptions('frontend');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const frontendValue = event.target.value as FrontendPriority;
    const backendValue = convertPriorityToBackend(frontendValue);
    onChange(backendValue);
  };

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="">Select Priority</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface PriorityFilterProps {
  selectedPriorities: FrontendPriority[];
  onChange: (priorities: FrontendPriority[]) => void;
  className?: string;
}

/**
 * Component for filtering by multiple priorities
 */
export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  selectedPriorities,
  onChange,
  className = ''
}) => {
  const options = getPriorityOptions('frontend');

  const handleToggle = (priority: FrontendPriority) => {
    const newSelection = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    onChange(newSelection);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Filter by Priority:</label>
      <div className="space-y-1">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedPriorities.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center">
              <span className="mr-1">{getPriorityIcon(option.value)}</span>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Example usage in a message list component:
/*
import { PriorityDisplay, PrioritySelector } from '../components/UI/PriorityComponents';

// Display priority
<PriorityDisplay priority={message.priority} />

// Select priority for feedback
<PrioritySelector 
  value={selectedPriority}
  onChange={(backendPriority) => {
    // backendPriority is already in backend format ('high' | 'medium' | 'low')
    submitFeedback(messageId, backendPriority);
  }}
/>
*/
