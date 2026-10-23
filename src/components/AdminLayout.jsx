import React from "react";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "./AdminHeader";
import { ProtectedRoute } from "./ProtectedRoute";

export function AdminLayout() {
  return (
    <ProtectedRoute>
      <div className="app-layout admin-layout">
        <AdminHeader />
        <div className="main-content-area admin-content-area">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
