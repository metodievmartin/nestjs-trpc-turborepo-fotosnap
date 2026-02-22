'use client';

import LoginForm from '@/components/auth/login-form';
import { LoginFormData } from '@/lib/auth/schema';
import { authClient } from '@/lib/auth/client';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { useRouter } from 'next/dist/client/components/navigation';
import { UseFormSetError } from 'react-hook-form';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (
    data: LoginFormData,
    setError: UseFormSetError<LoginFormData>
  ) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: getAuthErrorMessage(error.code) });
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-extrabold">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign up here
            </a>
          </p>
        </div>
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
