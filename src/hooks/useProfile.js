// src/hooks/useProfile.js
import { useState, useEffect } from "react";
import authService from "../services/authService";
import { getProfile, saveProfile } from "../services/profileService";

export const useProfile = () => {
  const [adminName, setAdminName] = useState("Guest");
  const [profilePhoto, setProfilePhoto] = useState("/assets/placeholder.png");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await authService.getAdminProfile();
      
      if (data?.success && data.profile) {
        const { name, photo } = data.profile;
        setAdminName(name || "Admin");
        setProfilePhoto(photo || "/assets/placeholder.png");
        
        // Save locally for faster reloads
        saveProfile({ name, photo });
      } else {
        // Fallback to cached data
        const cached = getProfile();
        setAdminName(cached?.name || "Guest");
        setProfilePhoto(cached?.photo || "/assets/placeholder.png");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      
      // Fallback to cached data on error
      const cached = getProfile();
      setAdminName(cached?.name || "Guest");
      setProfilePhoto(cached?.photo || "/assets/placeholder.png");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Listen for profileUpdated event
    const handleProfileUpdate = (event) => {
      const { name, photo } = event.detail;
      setAdminName(name || "Guest");
      setProfilePhoto(photo || "/assets/placeholder.png");
    };

    // Listen for storage change (multi-tab sync)
    const handleStorage = () => {
      const cached = getProfile();
      setAdminName(cached?.name || "Guest");
      setProfilePhoto(cached?.photo || "/assets/placeholder.png");
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorage);

    // Refresh profile every 60 seconds
    const interval = setInterval(fetchProfile, 60000);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return { 
    adminName, 
    profilePhoto, 
    loading, 
    refreshProfile: fetchProfile 
  };
};