// src/components/common/NotificationMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { io as socketIO } from "socket.io-client";
import { API_CONFIG } from "../../utils/constants";

const API_URL = import.meta.env.VITE_API_URL || API_CONFIG;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_CONFIG;

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
  console.log("[INIT] NotificationMenu mounted");
  console.log("API URL =", API_URL);
  console.log("SOCKET URL =", SOCKET_URL);
  console.log("Connecting socket...");

  socketRef.current = socketIO(SOCKET_URL.BASE_URL, {
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
  });

  const socket = socketRef.current; // <-- THE REQUIRED LINE

  // Debug listeners
  socket.on("connect", () => {
    console.log(" SOCKET CONNECTED:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("SOCKET CONNECT ERROR:", err.message);
    console.log("Full error:", err);
    console.log("document.cookie =", document.cookie);
  });

  socket.on("disconnect", (reason) => {
    console.warn("SOCKET DISCONNECTED:", reason);
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    console.log("Fetching notifications...");
    try {
      const res = await axios.get(`${API_URL.BASE_URL}/api/notifications`, {
        withCredentials: true,
      });

      console.log("Notifications received:", res.data);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(" Notification fetch error:", err);
      setNotifications([]);
    }
  };

  fetchNotifications();

  return () => {
    console.log(" Cleanup: disconnecting socket...");
    socket.disconnect();
  };
}, []);


  const markAsRead = async (id) => {
    console.log(" Marking notification as read:", id);
    try {
      await axios.patch(
        `${API_URL.BASE_URL}/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );

      console.log(" Marked as read SUCCESS");

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(" Mark-as-read FAILED:", err.response?.data || err.message);
    }
  };

  const clearNotifications = async () => {
    console.log("Clearing all notifications...");
    try {
      await axios.delete(`${API_URL.BASE_URL}/api/notifications`, {
        withCredentials: true
      });

      console.log(" Notifications cleared");

      setNotifications([]);
    } catch (err) {
      console.error("Clear notifications FAILED:", err.response?.data || err.message);
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <div className="notification-wrapper" ref={notifRef}>
      <button
        className="notification-btn"
        onClick={() => {
          console.log(" Notification icon clicked");
          setNotifOpen(!notifOpen);
        }}
        aria-label="Notifications"
      >
        <IoMdNotificationsOutline size={24} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
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
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
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
                  onClick={() => {
                    console.log(" Notification clicked:", n);
                    !n.isRead && markAsRead(n._id);
                  }}
                  style={{ cursor: !n.isRead ? "pointer" : "default" }}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-grow-1">
                      <div className="notif-title fw-semibold">
                        {n.message}
                      </div>
                      <div className="notif-meta d-flex align-items-center mt-1">
                        <span
                          className={`notif-tag notif-${n.type || "info"} badge`}
                        >
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
                        style={{ width: "8px", height: "8px", padding: 0 }}
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

      <style>{`
        .notifications-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default NotificationMenu;
