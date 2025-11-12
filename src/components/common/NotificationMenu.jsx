// src/components/common/NotificationMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { io as socketIO } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    // ✅ Initialize Socket.IO connection
    socketRef.current = socketIO(SOCKET_URL, { 
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // ✅ Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    // ✅ Listen for real-time notifications
    socket.on("new-notification", (payload) => {
      console.log("🔔 New notification received:", payload);
      setNotifications((prev) => [payload, ...prev].slice(0, 20));
    });

    // ✅ Listen for notification updates
    socket.on("notification-updated", (updatedNotification) => {
      console.log("📝 Notification updated:", updatedNotification);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === updatedNotification._id ? updatedNotification : n
        )
      );
    });

    // ✅ Listen for notification deletions
    socket.on("notification-deleted", (deletedId) => {
      console.log("🗑️ Notification deleted:", deletedId);
      setNotifications((prev) => prev.filter((n) => n._id !== deletedId));
    });

    // ✅ Listen for bulk notification clear
    socket.on("notifications-cleared", () => {
      console.log("🧹 All notifications cleared");
      setNotifications([]);
    });

    // ✅ Handle connection events
    socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
    });

    // ✅ Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // ✅ Cleanup function
    return () => {
      socket.off("new-notification");
      socket.off("notification-updated");
      socket.off("notification-deleted");
      socket.off("notifications-cleared");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
      console.log("🔌 Socket.IO disconnected and cleaned up");
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  // ✅ Clear all notifications
  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Optimistically update UI
      setNotifications([]);
    } catch (err) {
      console.error("❌ Error clearing notifications:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-wrapper" ref={notifRef}>
      <button
        className="notification-btn"
        onClick={() => setNotifOpen(!notifOpen)}
        aria-label="Notifications"
      >
        <IoMdNotificationsOutline size={24} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div className="dropdown-menu show position-absolute end-0 mt-2 notif-dropdown">
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <span className="fw-bold">
              Notifications
              {unreadCount > 0 && (
                <span className="badge bg-primary ms-2">{unreadCount}</span>
              )}
            </span>
            {notifications.length > 0 && (
              <button
                className="btn btn-sm btn-link text-danger"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>
          <hr className="m-1" />

          <div 
            className="notifications-list" 
            style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }}
          >
            {notifications.length === 0 ? (
              <div className="dropdown-item text-center text-muted py-3">
                <IoMdNotificationsOutline size={48} style={{ opacity: 0.3 }} />
                <p className="mb-0 mt-2">No new notifications</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n._id || `${n.type}-${n.time}-${idx}`}
                  className={`dropdown-item notif-item ${
                    n.isRead ? "notif-read" : "notif-unread"
                  }`}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  style={{ cursor: !n.isRead ? 'pointer' : 'default' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-grow-1">
                      <div className="notif-title fw-semibold">
                        {n.message}
                      </div>
                      <div className="notif-meta d-flex align-items-center mt-1">
                        <span className={`notif-tag notif-${n.type || "info"} badge`}>
                          {n.type || "info"}
                        </span>
                        <small className="ms-2 text-muted">
                          {formatTimestamp(n.time)}
                        </small>
                      </div>
                    </div>
                    {!n.isRead && (
                      <span 
                        className="badge bg-primary rounded-circle ms-2" 
                        style={{ width: '8px', height: '8px', padding: 0 }}
                        aria-label="Unread"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ✅ CSS for hiding scrollbar - moved to style tag */}
      <style>{`
        .notifications-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export default NotificationMenu