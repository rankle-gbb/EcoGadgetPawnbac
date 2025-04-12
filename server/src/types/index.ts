import { Context } from 'koa';

// Extend Koa Context to include user information
export interface AppContext extends Context {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// Error response interface
export interface ErrorResponse {
  status: number;
  message: string;
  stack?: string;
}

// Success response interface
export interface SuccessResponse<T> {
  status: number;
  data: T;
  message?: string;
}

// Pagination options interface
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Pagination result interface
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UpdateUserData {
  email?: string;
  mobile?: string;
  nickname?: string;
  isAdmin?: boolean;
}
