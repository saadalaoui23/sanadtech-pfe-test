/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Formats a number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Gets the initial letter from a name
 */
export const getInitialLetter = (name: string): string | null => {
  if (!name) return null;
  const firstLetter = name.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstLetter) ? firstLetter : null;
};
