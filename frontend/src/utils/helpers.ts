/**
 * Debounce function to limit function calls
 * Vital pour la barre de recherche (évite de spammer le backend)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

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
 * Formats a number with thousand separators (ex: 1,000,000)
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-US'); // Ou 'fr-FR' si vous préférez les espaces
};

/**
 * Gets the initial letter from a name
 */
export const getInitialLetter = (name: string): string | null => {
  if (!name) return null;
  const firstLetter = name.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstLetter) ? firstLetter : null;
};