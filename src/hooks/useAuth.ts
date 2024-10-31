import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserInfo } from '@/lib/user';
import { fetchRoles } from '@/lib/role';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  isSystem: number;
  permissions: Permission[];
}

interface RolesResponse {
  roles: Role[];
  permissions: Permission[];
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [allRolesAndPermissions, setAllRolesAndPermissions] = useState<RolesResponse | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 获取所有角色和权限数据
  const fetchRolesAndPermissions = useCallback(async () => {
    try {
      const response = await fetchRoles();
      if (response.data && response.data.code === 1) {
        setAllRolesAndPermissions(response.data.data);
      }
    } catch (error) {
      console.error('获取角色和权限数据失败:', error);
    }
  }, []);

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
      const [userResponse, rolesResponse] = await Promise.all([
        getUserInfo(),
        fetchRoles()
      ]);

      if (userResponse.data && userResponse.data.code === 1 &&
          rolesResponse.data && rolesResponse.data.code === 1) {
        
        setIsAuthenticated(true);
        const userData = userResponse.data.data;
        const rolesData = rolesResponse.data.data;
        
        setUserRole(userData.role);

        // 查找用户对应的角色及其权限
        const userRoleData = rolesData.roles.find(
          (role: Role) => role.name === userData.role
        );

        if (userRoleData) {
          setUserPermissions(userRoleData.permissions);
        } else {
          setUserPermissions([]);
        }

        setAllRolesAndPermissions(rolesData);
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
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const hasPermission = useCallback((requiredPermission: string) => {
    if (userRole === '超级管理员') return true;
    const hasPermission = userPermissions.some(permission => permission.name === requiredPermission);
    return hasPermission;
  }, [userRole, userPermissions]);

  return { 
    isAuthenticated, 
    isLoading, 
    userRole, 
    userPermissions, 
    allRolesAndPermissions,
    checkAuth, 
    hasPermission,
    fetchRolesAndPermissions 
  };
};