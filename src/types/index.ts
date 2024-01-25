import { Request } from 'express';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}
export interface CreateTenantRequest extends Request {
  body: ITenant;
}

export interface TokenPayload {
  sub: string;
  role: string;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: number;
    id?: string;
  };
}
export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshTokenPayload {
  id: string;
}

export interface ITenant {
  name: string;
  address: string;
}
