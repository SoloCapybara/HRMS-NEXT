import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserInfo } from '@/lib/user';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserInfo();
        if (response.data && response.data.code === 1) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          Cookies.remove('token');
        }
      } catch (error) {
        console.error('验证用户信息失败', error);
        setIsAuthenticated(false);
        Cookies.remove('token');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && router.pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && router.pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};