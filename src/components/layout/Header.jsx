import React, { useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import NotificationMenu from "../common/NotificationMenu";
import LanguageSelector from "../common/LanguageSelector";
import {
  getBreadcrumbsFromPath,
  generateBreadcrumbsFromTitle,
} from "../../utils/breadcrumbs";
import authService, { storage } from "../../services/authService";
import { useProfile } from "../../hooks/useProfile";
import "../../styles/Header.css";

const Header = ({ title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef();

  // ✅ Profile hook handles fetching, caching, and real-time updates
  const { adminName, profilePhoto, loading } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const breadcrumbs = title
    ? generateBreadcrumbsFromTitle(title)
    : getBreadcrumbsFromPath(location.pathname);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      console.log("🚪 Logging out...");

      await authService.logout();
      storage.clearAll();

      console.log("✅ Logout successful");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Logout error:", error);
      storage.clearAll();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="header">
      {/* === Left: Breadcrumbs === */}
      <div className="header-left">
        <div className="breadcrumbs d-flex align-items-center">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.path || "no-path"}-${index}`}>
              {crumb.path && index < breadcrumbs.length - 1 ? (
                <Link to={crumb.path}>{crumb.name}</Link>
              ) : (
                <span>{crumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="breadcrumb-separator">▶ </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* === Right: Profile + Actions === */}
      <div className="header-right">
        <LanguageSelector />
        <NotificationMenu />

        <div className="user-profile position-relative" ref={profileRef}>
          <div
            className="d-flex align-items-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer" }}
          >
            {loading ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <>
                <img
                  src={profilePhoto}
                  alt="User Avatar"
                  className="profile-photo"
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
                <span className="d-none d-md-inline ms-2">{adminName}</span>
                <FiChevronDown className="d-none d-md-inline ms-1" />
              </>
            )}
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu show position-absolute end-0 mt-2">
              <button
                className="dropdown-item"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
