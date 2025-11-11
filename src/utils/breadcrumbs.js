/**
 * Check if a string is a MongoDB ObjectId or UUID
 */
const isId = (str) => {
  return /^[a-f\d]{24}$/i.test(str) || /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(str);
};

/**
 * Generate breadcrumbs from URL pathname
 */
export const getBreadcrumbsFromPath = (pathname) => {
  const paths = pathname.split("/").filter((p) => p);
  
  // If root or just dashboard, return dashboard only
  if (paths.length === 0 || (paths.length === 1 && paths[0] === "dashboard")) {
    return [{ name: "Dashboard", path: "/dashboard" }];
  }

  const breadcrumbs = [{ name: "Dashboard", path: "/dashboard" }];
  let currentPath = "";

  paths.forEach((p) => {
    if (p === "dashboard") return;
    
    currentPath += `/${p}`;
    const name = isId(p) ? "Detail" : p.charAt(0).toUpperCase() + p.slice(1);
    breadcrumbs.push({ name, path: currentPath });
  });

  return breadcrumbs;
};

/**
 * Generate breadcrumbs from page title (format: "Section / Page")
 */
export const generateBreadcrumbsFromTitle = (title) => {
  const parts = title.split(" / ").map((p) => p.trim());
  const breadcrumbs = [{ name: "Dashboard", path: "/dashboard" }];

  if (parts.length > 0 && parts[0]) {
    breadcrumbs.push({ 
      name: parts[0], 
      path: `/${parts[0].toLowerCase()}` 
    });
  }

  if (parts.length > 1 && parts[1]) {
    breadcrumbs.push({ name: parts[1], path: "" });
  }

  return breadcrumbs;
};