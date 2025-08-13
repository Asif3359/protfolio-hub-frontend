import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminDashboardLayout } from './AdminDashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardLayout>
        {children}
      </AdminDashboardLayout>
    </ProtectedRoute>
  );
}
