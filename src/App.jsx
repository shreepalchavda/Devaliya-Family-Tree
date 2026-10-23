import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PublicLayout } from "./components/PublicLayout";
import { AdminLayout } from "./components/AdminLayout";

// Public Pages
import { Home } from "./pages/Home";
import { FamilyDetails } from "./pages/FamilyDetails";
import { MemberDetails } from "./pages/MemberDetails";

// Admin Pages
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ManageFamilies } from "./pages/ManageFamilies";
import { ManageMembers } from "./pages/ManageMembers";
import { AddFamilyPage } from "./pages/AddFamilyPage";
import { EditFamilyPage } from "./pages/EditFamilyPage";
import { AddMemberPage } from "./pages/AddMemberPage";
import { EditMemberPage } from "./pages/EditMemberPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. PUBLIC WEBSITE ROUTES (Completely clean & separated) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/family/:familyId" element={<FamilyDetails isAdminView={false} />} />
            <Route path="/member/:memberId" element={<MemberDetails isAdminView={false} />} />
          </Route>

          {/* 2. ADMIN AUTHENTICATION */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 3. DEDICATED ADMIN PORTAL ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="families" element={<ManageFamilies />} />
            <Route path="families/new" element={<AddFamilyPage />} />
            <Route path="families/:familyId" element={<FamilyDetails isAdminView={true} />} />
            <Route path="families/:familyId/edit" element={<EditFamilyPage />} />
            <Route path="families/:familyId/members/new" element={<AddMemberPage />} />
            <Route path="members" element={<ManageMembers />} />
            <Route path="members/:memberId" element={<MemberDetails isAdminView={true} />} />
            <Route path="members/:memberId/edit" element={<EditMemberPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
