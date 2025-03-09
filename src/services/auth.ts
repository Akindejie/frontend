import axios from 'axios';
import { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'owner' | 'tenant';
  token: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userType: 'owner' | 'tenant';
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/me', userData);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        '/auth/forgot-password',
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(
          errorMessage || 'Failed to process forgot password request'
        );
      }

      throw new Error(
        'An unexpected error occurred while processing your request.'
      );
    }
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        '/auth/reset-password',
        {
          token,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage || 'Failed to reset password');
      }

      throw new Error(
        'An unexpected error occurred while resetting your password.'
      );
    }
  },
};
