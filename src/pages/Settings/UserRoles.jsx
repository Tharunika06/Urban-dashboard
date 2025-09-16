import React, { useState } from "react";
import "../../styles/UserRoles.css";

const UserRoles = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", desc: "", permissions: [] });

  const roles = [
    {
      id: 1,
      name: "Admin",
      description: "Full Access",
      permissions: ["All Permissions"]
    },
    {
      id: 2,
      name: "Owner",
      description: "Manage Property Details",
      permissions: ["Dashboard", "Reviews"]
    },
    {
      id: 3,
      name: "User",
      description: "Property buying & user activities",
      permissions: ["Dashboard", "Orders", "Transactions", "Reviews"]
    }
  ];

  // Background + text color mapping
  const getPermissionStyle = (permission) => {
    const styleMap = {
      "All Permissions": { background: "#EBF0FF", color: "#2952CC" },
      "Dashboard": { background: "#EBF0FF", color: "#2952CC" },
      "Orders": { background: "#FFEFD2", color: "#996A13" },
      "Transactions": { background: "#F9DADA", color: "#A73636" },
      "Reviews": { background: "#EEF8F4", color: "#429777" },
      "Feedback": { background: "#FBDDF3", color: "#BE449B" },
      "Reports": { background: "#E7E4F9", color: "#6E62B6" }
    };
    return styleMap[permission] || { background: "#E0E0E0", color: "#333" };
  };

  const handlePermissionChange = (permission, isChecked) => {
    const perms = isChecked
      ? [...newRole.permissions, permission]
      : newRole.permissions.filter((p) => p !== permission);
    setNewRole({ ...newRole, permissions: perms });
  };

  return (
    <div>
      <div className="ur-header d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="ur-title">User Roles Management</h4>
          <p className="ur-subtitle">
            Manage user roles and their permissions across the system.
          </p>
        </div>
        <button
          className="btn ur-btn-black ur-add-btn"
          onClick={() => setShowRoleModal(true)}
        >
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="table-responsive">
        <table className="table ur-table">
          <thead>
            <tr>
              <th><input type="checkbox" className="form-check-input" /></th>
              <th>Role</th>
              <th>Description</th>
              <th>Permissions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td><input type="checkbox" className="form-check-input" /></td>
                <td className="ur-role-name">{role.name}</td>
                <td className="ur-role-desc">{role.description}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {role.permissions.map((permission, idx) => {
                      const { background, color } = getPermissionStyle(permission);
                      return (
                        <span
                          key={idx}
                          className="ur-permission"
                          style={{ backgroundColor: background, color }}
                        >
                          {permission}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button className="btn ur-save-btn">Save Changes</button>
      </div>

      {/* Add Role Modal */}
      {showRoleModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center">
          <div className="modal-dialog">
            <div className="modal-content ur-modal">
              {/* Modal Header */}
              <div className="ur-modal-header">
                <h5 className="ur-modal-title">Add New Role</h5>
                <button
                  type="button"
                  className="ur-close-btn"
                  onClick={() => setShowRoleModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="ur-modal-body">
                <div className="row mb-4">
                  {/* Left Column */}
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="ur-form-label">Role Name</label>
                      <input
                        placeholder="Enter role name"
                        className="form-control ur-input"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="ur-form-label">Description</label>
                      <input
                        placeholder="Enter role description"
                        className="form-control ur-input"
                        value={newRole.desc}
                        onChange={(e) => setNewRole({ ...newRole, desc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="mb-4">
                  <label className="ur-form-label">Permissions</label>
                  <div className="ur-permission-list">
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="dashboard"
                        checked={newRole.permissions.includes("Dashboard")}
                        onChange={(e) => handlePermissionChange("Dashboard", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="dashboard">
                        Dashboard
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="property"
                        checked={newRole.permissions.includes("Property")}
                        onChange={(e) => handlePermissionChange("Property", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="property">
                        Property
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agents"
                        checked={newRole.permissions.includes("Agents")}
                        onChange={(e) => handlePermissionChange("Agents", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="agents">
                        Agents
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customers"
                        checked={newRole.permissions.includes("Customers")}
                        onChange={(e) => handlePermissionChange("Customers", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="customers">
                        Customers
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="orders"
                        checked={newRole.permissions.includes("Orders")}
                        onChange={(e) => handlePermissionChange("Orders", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="orders">
                        Orders
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="transactions"
                        checked={newRole.permissions.includes("Transactions")}
                        onChange={(e) => handlePermissionChange("Transactions", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="transactions">
                        Transactions
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="reviews"
                        checked={newRole.permissions.includes("Reviews")}
                        onChange={(e) => handlePermissionChange("Reviews", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="reviews">
                        Reviews
                      </label>
                    </div>
                    <div className="ur-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="settings"
                        checked={newRole.permissions.includes("Settings")}
                        onChange={(e) => handlePermissionChange("Settings", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="settings">
                        Settings
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="ur-modal-footer">
                <button
                  className="btn ur-cancel-btn"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn ur-create-btn"
                  onClick={() => {
                    console.log(newRole);
                    setShowRoleModal(false);
                    setNewRole({ name: "", desc: "", permissions: [] });
                  }}
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;