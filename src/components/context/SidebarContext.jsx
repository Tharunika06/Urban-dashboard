import React, { createContext, useContext, useState } from 'react';

// Create Context
const SidebarContext = createContext();

// Context Provider
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};


export const useSidebar = () => useContext(SidebarContext);
