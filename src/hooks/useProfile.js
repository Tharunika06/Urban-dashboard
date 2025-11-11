import { useState, useEffect } from "react";
import authService from "../services/authService";
import { getProfile, saveProfile } from "../services/profileService";

/**
 * Custom hook to manage and auto-refresh the admin profile.
 * Syncs with backend, localStorage, and global profileUpdated event.
 */
export const useProfile = () => {
  const [adminName, setAdminName] = useState("Guest");
  const [profilePhoto, setProfilePhoto] = useState("/assets/placeholder.png");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch admin profile from backend
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
        // fallback to cached profile if no data
        const cached = getProfile();
        setAdminName(cached?.name || "Guest");
        setProfilePhoto(cached?.photo || "/assets/placeholder.png");
      }
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      const cached = getProfile();
      setAdminName(cached?.name || "Guest");
      setProfilePhoto(cached?.photo || "/assets/placeholder.png");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial backend fetch
    fetchProfile();

    // ✅ Listen for profileUpdated event from Settings page
    const handleProfileUpdate = (event) => {
      const { name, photo } = event.detail;
      console.log("🔄 Profile update event received in Header:", { name, photo });

      setAdminName(name || "Guest");
      setProfilePhoto(photo || "/assets/placeholder.png");
      saveProfile({ name, photo });
    };

    // ✅ Listen for storage change (multi-tab sync)
    const handleStorage = () => {
      const cached = getProfile();
      setAdminName(cached?.name || "Guest");
      setProfilePhoto(cached?.photo || "/assets/placeholder.png");
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorage);

    // Optional: refresh profile every minute
    const interval = setInterval(fetchProfile, 60000);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return { adminName, profilePhoto, loading, refreshProfile: fetchProfile };
};
