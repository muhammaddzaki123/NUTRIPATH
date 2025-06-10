// List of relative time patterns to detect already formatted strings
const relativeTimePatterns = [
  /^Baru saja$/,
  /^\d+ menit yang lalu$/,
  /^\d+ jam yang lalu$/,
  /^\d+ hari yang lalu$/
];

// Check if string is already in relative time format
const isRelativeTimeFormat = (text: string): boolean => {
  return relativeTimePatterns.some(pattern => pattern.test(text));
};

export const formatTimestamp = (timestamp: string | number | Date): string => {
  try {
    let date: Date;
    
    // Handle Date object
    if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle string timestamp
    else if (typeof timestamp === 'string') {
      // Check if already in relative time format
      const cleanTimestamp = timestamp.trim();
      if (isRelativeTimeFormat(cleanTimestamp)) {
        return cleanTimestamp; // Return as-is if already formatted
      }

      // Try parsing as ISO string
      date = new Date(cleanTimestamp);
      
      // Validate parsed date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid ISO string format');
      }
    }
    // Handle numeric timestamp (fallback)
    else if (typeof timestamp === 'number') {
      // Assume milliseconds for consistency with ISO string parsing
      date = new Date(timestamp);
      
      // Validate parsed date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid numeric timestamp');
      }
    }
    // Handle invalid input
    else {
      throw new Error('Invalid timestamp type');
    }

    // Final validation
    if (!date || isNaN(date.getTime())) {
      throw new Error('Invalid date object created');
    }

    // Get user's timezone offset in minutes
    const timezoneOffset = date.getTimezoneOffset();
    
    // Adjust date for Indonesia timezone (UTC+7)
    const indonesiaOffset = -420; // UTC+7 in minutes
    const adjustedDate = new Date(date.getTime() + (indonesiaOffset + timezoneOffset) * 60000);

    // Calculate time difference in minutes
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - adjustedDate.getTime()) / (1000 * 60));

    // Use relative time for recent notifications
    if (diffInMinutes < 1) {
      return 'Baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else if (diffInMinutes < 10080) { // Less than 7 days
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari yang lalu`;
    }

    // For older notifications, use full date format
    const formatter = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    });

    return formatter.format(adjustedDate);
  } catch (error) {
    console.error('Error formatting timestamp:', {
      error: (error as Error).message,
      timestamp,
      type: typeof timestamp,
      originalValue: timestamp
    });
    
    // Return a more informative string instead of current date
    return 'Format waktu tidak valid';
  }
};
