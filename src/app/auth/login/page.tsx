
import { LoginForm } from './LoginForm';
import { AuthGuard } from '../../components/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard>
      <LoginForm />
    </AuthGuard>
  );
}