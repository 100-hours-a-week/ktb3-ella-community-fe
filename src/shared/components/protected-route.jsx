import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/use-auth-store";

const ProtectedRoute = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location, // 원래 가려던 페이지 위치 기억
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
