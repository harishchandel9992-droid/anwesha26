"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditorLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="editor">
      {children}
    </ProtectedRoute>
  );
}
