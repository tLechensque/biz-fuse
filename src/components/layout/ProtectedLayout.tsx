import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "./Layout";
import { Outlet } from "react-router-dom";

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}
