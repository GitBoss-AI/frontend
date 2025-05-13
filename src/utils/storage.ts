/**
 * Safe browser storage utility that works with SSR
 */

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

/**
 * Safely get an item from localStorage
 * Returns null if localStorage is not available or item doesn't exist
 */
export const getItem = (key: string): string | null => {
  if (!isClient) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

/**
 * Safely set an item in localStorage
 * No-op if localStorage is not available
 */
export const setItem = (key: string, value: string): void => {
  if (!isClient) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Safely remove an item from localStorage
 * No-op if localStorage is not available
 */
export const removeItem = (key: string): void => {
  if (!isClient) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  if (!isClient) return false;
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};