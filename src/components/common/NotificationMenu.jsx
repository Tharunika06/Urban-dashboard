// src/components/common/NotificationMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { io as socketIO } from "socket.io-client";
import { API_CONFIG } from "../../utils/constants";
import {
  fetchNotifications,
  markNotificationAsRead,
  clearAllNotifications
} from "../../services/notificationService";
import "../../styles/NotificationMenu.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_CONFIG;

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("[INIT] NotificationMenu mounted");
    console.log("SOCKET URL =", SOCKET_URL);
    console.log("Connecting socket...");

    socketRef.current = socketIO(SOCKET_URL.BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });

    const socket = socketRef.current;

    // Debug listeners
    socket.on("connect", () => {
    });

    socket.on("connect_error", (err) => {
      console.error("SOCKET CONNECT ERROR:", err.message);
      console.log("Full error:", err);
      console.log("document.cookie =", document.cookie);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ SOCKET DISCONNECTED:", reason);
    });

    // Fetch notifications on mount
    const loadNotifications = async () => {
      console.log("Fetching notifications...");
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications");
        setNotifications([]);
      }
    };

    loadNotifications();

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark-as-read operation failed");
    }
  };

  const clearNotifications = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(" Clear notifications operation failed");
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

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="dropdown-item text-center text-muted py-3">
                <IoMdNotificationsOutline size={48} className="empty-icon" />
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
                    !n.isRead && markAsRead(n._id);
                  }}
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
                        className="unread-indicator badge bg-primary rounded-circle ms-2"
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