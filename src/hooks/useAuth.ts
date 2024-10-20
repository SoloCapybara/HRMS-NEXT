import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserInfo } from '@/lib/user';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      setIsAuthenticated(false);
      setUserRole('');
      setUserPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getUserInfo();
      if (response.data && response.data.code === 1) {
        setIsAuthenticated(true);
        setUserRole(response.data.data.role);
        // 如果是超级管理员，设置一个特殊的权限
        if (response.data.data.role === '超级管理员') {
          setUserPermissions(['ALL']);
        } else {
          // 对于其他角色，使用返回的权限或空数组
          setUserPermissions(response.data.data.permissions || []);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole('');
        setUserPermissions([]);
        Cookies.remove('token');
      }
    } catch (error) {
      console.error('验证用户信息失败', error);
      setIsAuthenticated(false);
      setUserRole('');
      setUserPermissions([]);
      Cookies.remove('token');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && router.pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && router.pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const hasPermission = useCallback((requiredPermission: string) => {
    return userRole === '超级管理员' || userPermissions.includes(requiredPermission);
  }, [userRole, userPermissions]);

  return { isAuthenticated, isLoading, userRole, userPermissions, checkAuth, hasPermission };
};