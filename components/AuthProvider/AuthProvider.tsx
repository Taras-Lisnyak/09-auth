'use client';

import { checkSession, getMe, logout } from '../../lib/api/clientApi';
import { useAuthStore } from '../../lib/store/authStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  const isPrivateRoute = pathname.startsWith('/profile') || pathname.startsWith('/notes');

  useEffect(() => {
    const fetchUser = async () => {
      setIsChecking(true);

      try {
        const hasSession = await checkSession();

        if (hasSession) {
          const user = await getMe();
          if (user) {
            setUser(user);
          }
        } else {
          await logout().catch(() => undefined);
          clearIsAuthenticated();

          if (isPrivateRoute) {
            router.replace('/sign-in');
          }
        }
      } catch {
        await logout().catch(() => undefined);
        clearIsAuthenticated();

        if (isPrivateRoute) {
          router.replace('/sign-in');
        }
      } finally {
        setIsChecking(false);
      }
    };

    fetchUser();
  }, [setUser, clearIsAuthenticated, isPrivateRoute, router, pathname]);

  if (isChecking && isPrivateRoute) {
    return <Loader />;
  }

  if (!isChecking && isPrivateRoute && !isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthProvider;