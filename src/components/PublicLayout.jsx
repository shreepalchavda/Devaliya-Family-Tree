import React from "react";
import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";

export function PublicLayout() {
  return (
    <div className="app-layout public-layout">
      <PublicHeader />
      <div className="main-content-area">
        <Outlet />
      </div>
    </div>
  );
}
