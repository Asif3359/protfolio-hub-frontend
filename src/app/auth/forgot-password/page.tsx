import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthGuard } from '../../../components/AuthGuard';

export default function ForgotPasswordPage() {
  return (
    <AuthGuard>
      <ForgotPasswordForm />
    </AuthGuard>
  );
}
