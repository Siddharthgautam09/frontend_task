import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate days until date
 */
export function daysUntil(date: string | Date): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: string | Date): boolean {
  return daysUntil(date) < 0;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert enum value to display text
 */
export function enumToDisplayText(value: string): string {
  return value
    .split('_')
    .map(word => capitalize(word.toLowerCase()))
    .join(' ');
}

/**
 * Get priority color class with enhanced visibility - black text for maximum contrast
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'text-black bg-green-200 border-green-400';
    case 'medium':
      return 'text-black bg-yellow-200 border-yellow-400';
    case 'high':
      return 'text-black bg-orange-200 border-orange-400';
    case 'critical':
    case 'urgent':
      return 'text-black bg-red-200 border-red-400';
    default:
      return 'text-black bg-gray-200 border-gray-400';
  }
}

/**
 * Get status color class with enhanced visibility
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'planning':
    case 'todo':
      return 'text-black bg-gray-100 border-gray-400';
    case 'in_progress':
      return 'text-black bg-blue-100 border-blue-400';
    case 'review':
    case 'testing':
      return 'text-black bg-yellow-100 border-yellow-400';
    case 'completed':
      return 'text-black bg-green-100 border-green-400';
    case 'on_hold':
    case 'blocked':
      return 'text-black bg-orange-100 border-orange-400';
    case 'cancelled':
      return 'text-black bg-red-100 border-red-400';
    default:
      return 'text-black bg-gray-100 border-gray-400';
  }
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate avatar initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Get user role color
 */
export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'manager':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'team_member':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate random color for charts
 */
export function generateChartColors(count: number): string[] {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#EC4899', // pink
    '#6366F1', // indigo
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

/**
 * Sort array by multiple criteria
 */
export function multiSort<T>(
  array: T[],
  sortBy: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, direction } of sortBy) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Group array by key
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}