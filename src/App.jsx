import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Pages
import { Home } from "./pages/Home";
import { FamilyDetails } from "./pages/FamilyDetails";
import { MemberDetails } from "./pages/MemberDetails";
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
    <ErrorBoundary>
      <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Header />
          <div className="main-content-area">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/family/:familyId" element={<FamilyDetails />} />
              <Route path="/member/:memberId" element={<MemberDetails />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
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
                path="/admin/families/new"
                element={
                  <ProtectedRoute>
                    <AddFamilyPage />
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
                path="/admin/families/:familyId/members/new"
                element={
                  <ProtectedRoute>
                    <AddMemberPage />
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
                path="/admin/members/:memberId/edit"
                element={
                  <ProtectedRoute>
                    <EditMemberPage />
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
