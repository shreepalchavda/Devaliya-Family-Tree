import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminHeader } from "./components/AdminHeader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Admin Pages
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ManageFamilies } from "./pages/ManageFamilies";
import { ManageMembers } from "./pages/ManageMembers";
import { AddFamilyPage } from "./pages/AddFamilyPage";
import { EditFamilyPage } from "./pages/EditFamilyPage";
import { AddMemberPage } from "./pages/AddMemberPage";
import { EditMemberPage } from "./pages/EditMemberPage";
import { FamilyDetails } from "./pages/FamilyDetails";
import { MemberDetails } from "./pages/MemberDetails";

export default function AppAdmin() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <div className="app-layout admin-layout">
          <AdminHeader />
          <div className="main-content-area">
            <Routes>
              {/* Login Route */}
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Families Management */}
              <Route
                path="/families"
                element={
                  <ProtectedRoute>
                    <ManageFamilies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/families"
                element={
                  <ProtectedRoute>
                    <ManageFamilies />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/families/new"
                element={
                  <ProtectedRoute>
                    <AddFamilyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/families/new"
                element={
                  <ProtectedRoute>
                    <AddFamilyPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/families/:familyId/edit"
                element={
                  <ProtectedRoute>
                    <EditFamilyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/families/:familyId/edit"
                element={
                  <ProtectedRoute>
                    <EditFamilyPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/families/:familyId/members/new"
                element={
                  <ProtectedRoute>
                    <AddMemberPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/families/:familyId/members/new"
                element={
                  <ProtectedRoute>
                    <AddMemberPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/families/:familyId"
                element={
                  <ProtectedRoute>
                    <FamilyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/families/:familyId"
                element={
                  <ProtectedRoute>
                    <FamilyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family/:familyId"
                element={
                  <ProtectedRoute>
                    <FamilyDetails />
                  </ProtectedRoute>
                }
              />

              {/* Members Management */}
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <ManageMembers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute>
                    <ManageMembers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members/:memberId/edit"
                element={
                  <ProtectedRoute>
                    <EditMemberPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members/:memberId/edit"
                element={
                  <ProtectedRoute>
                    <EditMemberPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members/:memberId"
                element={
                  <ProtectedRoute>
                    <MemberDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members/:memberId"
                element={
                  <ProtectedRoute>
                    <MemberDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/member/:memberId"
                element={
                  <ProtectedRoute>
                    <MemberDetails />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  );
}
