import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicHeader } from "./components/PublicHeader";

// Public Pages
import { Home } from "./pages/Home";
import { FamilyDetails } from "./pages/FamilyDetails";
import { MemberDetails } from "./pages/MemberDetails";

export default function AppPublic() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <PublicHeader />
        <div className="main-content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/family/:familyId" element={<FamilyDetails />} />
            <Route path="/member/:memberId" element={<MemberDetails />} />

            {/* Any unrecognized or admin routes on public site simply redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
