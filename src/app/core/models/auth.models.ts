export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  responseCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiry: string;
    user: User;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  responseCode: number;
  message: string;
  data: T;
}