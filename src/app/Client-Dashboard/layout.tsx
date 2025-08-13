import { ProtectedRoute } from '../components/ProtectedRoute';
import { ClientDashboardLayout } from './ClientDashboardLayout';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer">
      <ClientDashboardLayout>
        {children}
      </ClientDashboardLayout>
    </ProtectedRoute>
  );
}
