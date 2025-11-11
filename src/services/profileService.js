// src/services/profileService.js

/**
 * Profile Service
 * Manages admin profile data with localStorage fallback
 * ⚠️ Does NOT make API calls - only reads from localStorage
 * This prevents logout issues when profile doesn't exist yet
 */

const PROFILE_STORAGE_KEY = 'adminProfile';

/**
 * Get profile from localStorage (no API call)
 * Returns default values if no profile exists
 */
export const getProfile = () => {
  try {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      console.log("📖 Profile loaded from localStorage:", profile);
      
      return {
        name: profile.name || "Guest",
        phone: profile.phone || "",
        photo: profile.photo || "/assets/placeholder.png"
      };
    }
    
    // Return defaults if no profile in storage
    console.log("ℹ️ No profile in localStorage, using defaults");
    return {
      name: "Guest",
      phone: "",
      photo: "/assets/placeholder.png"
    };
    
  } catch (error) {
    console.error("❌ Error reading profile from localStorage:", error);
    return {
      name: "Guest",
      phone: "",
      photo: "/assets/placeholder.png"
    };
  }
};

/**
 * Save profile to localStorage
 * Called when profile is created/updated
 */
export const saveProfile = (profileData) => {
  try {
    const profile = {
      name: profileData.name || "",
      phone: profileData.phone || "",
      photo: profileData.photo || "/assets/placeholder.png"
    };
    
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    console.log("💾 Profile saved to localStorage:", profile);
    
    // Dispatch event so other components update
    window.dispatchEvent(new CustomEvent("profileUpdated", {
      detail: profile
    }));
    
    return profile;
  } catch (error) {
    console.error("❌ Error saving profile to localStorage:", error);
    throw error;
  }
};

/**
 * Clear profile from localStorage
 * Called on logout
 */
export const clearProfile = () => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    console.log("🗑️ Profile cleared from localStorage");
  } catch (error) {
    console.error("❌ Error clearing profile:", error);
  }
};

/**
 * Update profile photo only
 */
export const updateProfilePhoto = (photoUrl) => {
  try {
    const currentProfile = getProfile();
    const updatedProfile = {
      ...currentProfile,
      photo: photoUrl || "/assets/placeholder.png"
    };
    
    return saveProfile(updatedProfile);
  } catch (error) {
    console.error("❌ Error updating profile photo:", error);
    throw error;
  }
};

export default {
  getProfile,
  saveProfile,
  clearProfile,
  updateProfilePhoto
};