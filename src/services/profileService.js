// src/services/profileService.js

const PROFILE_KEY = 'admin_profile';

/**
 * Save profile data to localStorage
 */
export const saveProfile = (profileData) => {
  try {
    const dataToSave = {
      name: profileData.name || 'Guest',
      photo: profileData.photo || '/assets/placeholder.png',
      phone: profileData.phone || '',
      timestamp: Date.now()
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
};

/**
 * Get profile data from localStorage
 */
export const getProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to load profile:', err);
    return null;
  }
};

/**
 * Clear profile data from localStorage
 */
export const clearProfile = () => {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch (err) {
    console.error('Failed to clear profile:', err);
  }
};

/**
 * Check if profile data exists in localStorage
 */
export const hasProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return !!stored;
  } catch (err) {
    return false;
  }
};