import { ResetPasswordForm } from './ResetPasswordForm';
import { AuthGuard } from '../../../components/AuthGuard';

export default function ResetPasswordPage() {
  return (
    <AuthGuard>
      <ResetPasswordForm />
    </AuthGuard>
  );
}
