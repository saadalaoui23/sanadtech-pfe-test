export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatUser = (user) => {
  return {
    id: user.id || user._id,
    name: user.name || `${user.firstName} ${user.lastName}`,
    email: user.email,
  };
};

export const getInitialLetter = (name) => {
  if (!name) return null;
  const firstLetter = name.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstLetter) ? firstLetter : null;
};

export default {
  debounce,
  formatUser,
  getInitialLetter,
};
