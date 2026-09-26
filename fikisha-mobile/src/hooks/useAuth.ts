import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { decodeJwtPayload } from '@/lib/jwt';
import { LoginDto } from '@/types';

export function useAuth() {
  const {
    token,
    user,
    isAuthenticated,
    isLoading,
    isFirstLogin,
    setAuth,
    clearAuth,
    initAuth,
    setFirstLoginDone,
  } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (dto: LoginDto) => {
    const { data } = await authService.login(dto);
    const { accessToken } = data;

    const payload = decodeJwtPayload(accessToken);

    const isFirst = dto.password === dto.phone;

    await setAuth(
      accessToken,
      {
        id: payload.sub,
        schoolId: payload.schoolId,
        role: payload.role,
        phone: payload.phone,
        name: '',
      },
      isFirst,
    );
  };

  const logout = async () => {
    await clearAuth();
  };

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    isFirstLogin,
    login,
    logout,
    setFirstLoginDone,
  };
}