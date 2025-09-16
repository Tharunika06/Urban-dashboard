// src/components/common/NotificationMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { io as socketIO } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = socketIO(SOCKET_URL, { withCredentials: true });

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    // ✅ Fetch notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    // ✅ Listen for real-time notifications
    const onNewNotification = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 20));
    };
    socket.on("new-notification", onNewNotification);

    // ✅ Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.off("new-notification", onNewNotification);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // ✅ Clear all notifications
  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  return (
    <div className="notification-wrapper" ref={notifRef}>
      <button
        className="notification-btn"
        onClick={() => setNotifOpen(!notifOpen)}
      >
        <IoMdNotificationsOutline />
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span className="notif-badge">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>

      {notifOpen && (
        <div className="dropdown-menu show position-absolute end-0 mt-2 notif-dropdown">
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <span className="fw-bold">Notifications</span>
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

          {notifications.length === 0 ? (
            <div className="dropdown-item">No new notifications</div>
          ) : (
            notifications.map((n, idx) => (
              <div
                key={n._id || `${n.type}-${n.time}-${idx}`}
                className={`dropdown-item notif-item ${
                  n.isRead ? "notif-read" : ""
                }`}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                <div className="notif-title">{n.message}</div>
                <div className="notif-meta">
                  <span className={`notif-tag notif-${n.type || "info"}`}>
                    {n.type || "info"}
                  </span>
                  <small className="ms-2">
                    {new Date(n.time).toLocaleString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
