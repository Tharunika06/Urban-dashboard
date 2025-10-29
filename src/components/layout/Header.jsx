// src/components/layout/Header.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import NotificationMenu from "../common/NotificationMenu";
import LanguageSelector from "../common/LanguageSelector";
import "../../styles/Header.css";

const Header = ({ title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("Guest");
  const [profilePhoto, setProfilePhoto] = useState("/assets/placeholder.png");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef();

  const getBreadcrumbsFromPath = (pathname) => {
    const paths = pathname.split("/").filter((p) => p);
    if (paths.length === 0 || (paths.length === 1 && paths[0] === "dashboard")) {
      return [{ name: "Dashboard", path: "/dashboard" }];
    }
    const breadcrumbs = [{ name: "Dashboard", path: "/dashboard" }];
    let currentPath = "";
    paths.forEach((p) => {
      if (p === "dashboard") return;
      currentPath += `/${p}`;
      const isId =
        /^[a-f\d]{24}$/i.test(p) || /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(p);
      const name = isId ? "Detail" : p.charAt(0).toUpperCase() + p.slice(1);
      breadcrumbs.push({ name, path: currentPath });
    });
    return breadcrumbs;
  };

  const generateBreadcrumbsFromTitle = (title) => {
    const parts = title.split(" / ").map((p) => p.trim());
    const breadcrumbs = [{ name: "Dashboard", path: "/dashboard" }];
    if (parts.length > 0 && parts[0]) {
      breadcrumbs.push({ name: parts[0], path: `/${parts[0].toLowerCase()}` });
    }
    if (parts.length > 1 && parts[1]) {
      breadcrumbs.push({ name: parts[1], path: "" });
    }
    return breadcrumbs;
  };

  const breadcrumbs = title
    ? generateBreadcrumbsFromTitle(title)
    : getBreadcrumbsFromPath(location.pathname);

  useEffect(() => {
    // Load initial profile data
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("adminProfile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setAdminName(parsed.name || "Guest");
          setProfilePhoto(parsed.photo || "/assets/placeholder.png");
        } catch {
          setAdminName("Guest");
          setProfilePhoto("/assets/placeholder.png");
        }
      }
    };

    // Initial load
    loadProfile();

    // Listen for profile updates from GeneralSettings
    const handleProfileUpdate = (event) => {
      const { name, photo } = event.detail;
      setAdminName(name || "Guest");
      setProfilePhoto(photo || "/assets/placeholder.png");
    };

    // Add event listeners
    window.addEventListener("profileUpdated", handleProfileUpdate);
    
    // Keep the storage event listener as fallback for cross-tab updates
    window.addEventListener("storage", loadProfile);

    // Cleanup
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  return (
    <header className="header">
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

      <div className="header-right">
        {/* Replace the old lang-selector with the new LanguageSelector component */}
        <LanguageSelector />

        <NotificationMenu />

        <div className="user-profile position-relative" ref={profileRef}>
          <div
            className="d-flex align-items-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer" }}
          >
            <img src={profilePhoto} alt="User Avatar" />
            <span className="d-none d-md-inline ms-2">{adminName}</span>
            <FiChevronDown className="d-none d-md-inline ms-1" />
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu show position-absolute end-0 mt-2">
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;