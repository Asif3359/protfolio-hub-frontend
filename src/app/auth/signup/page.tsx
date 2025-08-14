import { SignupForm } from './SignupForm';
import { AuthGuard } from '../../../components/AuthGuard';

export default function SignupPage() {
  return (
    <AuthGuard>
      <SignupForm />
    </AuthGuard>
  );
}
