// Priority Utilities - Helper functions for priority mapping and display
import { priorityMapping, BackendPriority, FrontendPriority } from '../services/api';

// Re-export priorityMapping for direct use in other components
export { priorityMapping };

// Import the Priority type from PriorityTag
import { Priority } from '../components/UI/PriorityTag';

/**
 * Convert Priority (from PriorityTag) to FrontendPriority (from API)
 * @param priority - Priority type from UI components
 * @returns FrontendPriority type for API calls
 */
export const convertPriorityToFrontend = (priority: Priority): FrontendPriority => {
  const mapping: Record<Priority, FrontendPriority> = {
    'very_urgent': 'urgent',
    'important': 'important',
    'not_important': 'not important'
  };
  return mapping[priority];
};

/**
 * Get display-friendly priority label for UI
 * @param backendPriority - Priority from backend ('high' | 'medium' | 'low')
 * @returns User-friendly priority label ('urgent' | 'important' | 'not important')
 */
export const getPriorityDisplayLabel = (backendPriority: BackendPriority): FrontendPriority => {
  return priorityMapping.toFrontend(backendPriority);
};

/**
 * Convert user-selected priority back to backend format
 * @param frontendPriority - User-selected priority ('urgent' | 'important' | 'not important')
 * @returns Backend priority format ('high' | 'medium' | 'low')
 */
export const convertPriorityToBackend = (frontendPriority: FrontendPriority): BackendPriority => {
  return priorityMapping.toBackend(frontendPriority);
};

/**
 * Get priority-specific styling classes
 * @param priority - Priority level (backend or frontend format)
 * @returns CSS classes for styling
 */
export const getPriorityStyle = (priority: BackendPriority | FrontendPriority): string => {
  // Normalize to frontend format for consistent styling
  const frontendPriority = isPriorityBackendFormat(priority) 
    ? priorityMapping.toFrontend(priority as BackendPriority)
    : priority as FrontendPriority;

  const styles = {
    'urgent': 'bg-red-100 text-red-800 border-red-200',
    'important': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    'not important': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return styles[frontendPriority] || styles['not important'];
};

/**
 * Get priority icon
 * @param priority - Priority level (backend or frontend format)
 * @returns Icon name or component
 */
export const getPriorityIcon = (priority: BackendPriority | FrontendPriority): string => {
  // Normalize to frontend format
  const frontendPriority = isPriorityBackendFormat(priority) 
    ? priorityMapping.toFrontend(priority as BackendPriority)
    : priority as FrontendPriority;

  const icons = {
    'urgent': '🔴',
    'important': '🟡',
    'not important': '⚪'
  };

  return icons[frontendPriority] || icons['not important'];
};

/**
 * Get all priority options for dropdowns/selectors
 * @param format - Whether to return backend or frontend format
 * @returns Array of priority options
 */
export const getPriorityOptions = (format: 'backend' | 'frontend' = 'frontend') => {
  if (format === 'backend') {
    return [
      { value: 'high' as BackendPriority, label: 'High' },
      { value: 'medium' as BackendPriority, label: 'Medium' },
      { value: 'low' as BackendPriority, label: 'Low' }
    ];
  }

  return [
    { value: 'urgent' as FrontendPriority, label: 'Urgent', backendValue: 'high' as BackendPriority },
    { value: 'important' as FrontendPriority, label: 'Important', backendValue: 'medium' as BackendPriority },
    { value: 'not important' as FrontendPriority, label: 'Not Important', backendValue: 'low' as BackendPriority }
  ];
};

/**
 * Check if priority is in backend format
 * @param priority - Priority string to check
 * @returns True if backend format, false if frontend format
 */
function isPriorityBackendFormat(priority: string): boolean {
  return ['high', 'medium', 'low'].includes(priority);
}

/**
 * Sort messages by priority (urgent first)
 * @param messages - Array of messages with priority
 * @param order - Sort order ('asc' for urgent first, 'desc' for not important first)
 * @returns Sorted messages array
 */
export const sortMessagesByPriority = <T extends { priority: BackendPriority }>(
  messages: T[], 
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  const priorityOrder = order === 'asc' 
    ? { high: 0, medium: 1, low: 2 }
    : { low: 0, medium: 1, high: 2 };

  return [...messages].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

/**
 * Filter messages by priority
 * @param messages - Array of messages with priority
 * @param targetPriority - Priority to filter by (backend or frontend format)
 * @returns Filtered messages array
 */
export const filterMessagesByPriority = <T extends { priority: BackendPriority }>(
  messages: T[], 
  targetPriority: BackendPriority | FrontendPriority
): T[] => {
  // Normalize to backend format for comparison
  const backendPriority = isPriorityBackendFormat(targetPriority) 
    ? targetPriority as BackendPriority
    : priorityMapping.toBackend(targetPriority as FrontendPriority);

  return messages.filter(message => message.priority === backendPriority);
};

/**
 * Get priority statistics
 * @param messages - Array of messages with priority
 * @returns Priority breakdown statistics
 */
export const getPriorityStats = <T extends { priority: BackendPriority }>(messages: T[]) => {
  const stats = {
    urgent: 0,
    important: 0,
    'not important': 0,
    total: messages.length
  };

  messages.forEach(message => {
    const frontendPriority = priorityMapping.toFrontend(message.priority);
    stats[frontendPriority]++;
  });

  return {
    ...stats,
    percentages: {
      urgent: messages.length > 0 ? Math.round((stats.urgent / messages.length) * 100) : 0,
      important: messages.length > 0 ? Math.round((stats.important / messages.length) * 100) : 0,
      'not important': messages.length > 0 ? Math.round((stats['not important'] / messages.length) * 100) : 0
    }
  };
};

// Example usage:
/*
import { getPriorityDisplayLabel, convertPriorityToBackend, getPriorityStyle } from '../utils/priorityUtils';

// In your component:
const backendPriority = 'high'; // from API
const displayLabel = getPriorityDisplayLabel(backendPriority); // 'urgent'
const styleClasses = getPriorityStyle(backendPriority); // 'bg-red-100 text-red-800 border-red-200'

// When submitting feedback:
const userSelection = 'urgent'; // from UI
const backendValue = convertPriorityToBackend(userSelection); // 'high'
await api.submitMessageFeedback(messageId, backendValue);
*/
