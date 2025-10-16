// Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '/src/styles/Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: '/assets/dash-icon.png', label: 'Dashboard' },
  { path: '/property', icon: '/assets/property-icon.png', label: 'Property' },
  { path: '/owners', icon: '/assets/agents-icon.png', label: 'Property Owners' },
  { path: '/customers', icon: '/assets/customer-icon.png', label: 'Customers' },
  { path: '/orders', icon: '/assets/orders-icon.png', label: 'Orders' },
  { path: '/transaction', icon: '/assets/transac-icon.png', label: 'Transaction' },
  { path: '/reviews', icon: '/assets/rs-icon.png', label: 'Reviews' },
  { path: '/settings', icon: '/assets/rs-icon.png', label: 'Settings' }
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/assets/logo.png" alt="Urban Logo" className="logo-icon" />
        <button className="list-icon" onClick={toggleSidebar}>
          <img src="/assets/list.png" alt="Toggle Sidebar" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={`${item.path}-${index}`} className={isActive(item.path) ? 'active' : ''}>
              <Link
                to={item.path}
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                }}
              >
                <img src={item.icon} alt={item.label} className="icon-img" />
                <span className={`label-text ${isCollapsed ? 'hide' : ''}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
