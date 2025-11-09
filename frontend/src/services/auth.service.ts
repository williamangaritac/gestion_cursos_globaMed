import api from '@/lib/axios';
import Cookies from 'js-cookie';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Save tokens and user to cookies
    Cookies.set('accessToken', accessToken, { expires: 1 / 96 }); // 15 minutes
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;

    // Save tokens and user to cookies
    Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear cookies regardless of API response
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;

    // Update tokens
    Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.post<User>('/auth/me');
    return response.data;
  },

  getStoredUser(): User | null {
    const userStr = Cookies.get('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  },

  getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

