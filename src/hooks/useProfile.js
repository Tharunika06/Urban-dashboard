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
    fetchProfile();

    // ✅ Listen for profileUpdated event - just update state, don't save
    const handleProfileUpdate = (event) => {
      const { name, photo } = event.detail;
      console.log("🔄 Profile update event received:", { name, photo });

      setAdminName(name || "Guest");
      setProfilePhoto(photo || "/assets/placeholder.png");
      // ✅ No saveProfile() call here - already saved by whoever dispatched the event
    };

    // ✅ Listen for storage change (multi-tab sync)
    const handleStorage = () => {
      const cached = getProfile();
      setAdminName(cached?.name || "Guest");
      setProfilePhoto(cached?.photo || "/assets/placeholder.png");
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(fetchProfile, 60000);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return { adminName, profilePhoto, loading, refreshProfile: fetchProfile };
};