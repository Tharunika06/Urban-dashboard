// src/services/notificationService.js
import axios from "axios";
import { API_CONFIG } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL || API_CONFIG;

/**
 * Fetch all notifications for the current user
 */
export const fetchNotifications = async () => {
  try {
    const res = await axios.get(`${API_URL.BASE_URL}/api/notifications`, {
      withCredentials: true,
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Notification fetch error:", err);
    throw err;
  }
};

/**
 * Mark a notification as read
 * @param {string} id - Notification ID
 */
export const markNotificationAsRead = async (id) => {
  try {
    await axios.patch(
      `${API_URL.BASE_URL}/api/notifications/${id}/read`,
      {},
      { withCredentials: true }
    );
    return true;
  } catch (err) {
    console.error("Mark-as-read FAILED:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Clear all notifications for the current user
 */
export const clearAllNotifications = async () => {
  try {
    await axios.delete(`${API_URL.BASE_URL}/api/notifications`, {
      withCredentials: true
    });
    return true;
  } catch (err) {
    console.error("Clear notifications FAILED:", err.response?.data || err.message);
    throw err;
  }
};