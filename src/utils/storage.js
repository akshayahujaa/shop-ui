export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading key "${key}" from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing key "${key}" to localStorage:`, error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}" from localStorage:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
