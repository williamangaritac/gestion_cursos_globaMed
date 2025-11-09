// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Program Types
export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  instructorId?: string;
  instructor?: User;
  maxStudents: number;
  currentStudents: number;
  availableSeats: number;
  capacityPercentage: number;
  isFull: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  programId: string;
  program?: Program;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tokenType: string;
  expiresIn: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filter Types
export interface UserFilters extends PaginationParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface ProgramFilters extends PaginationParams {
  status?: ProgramStatus;
  instructorId?: string;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  availableOnly?: boolean;
}

export interface EnrollmentFilters extends PaginationParams {
  status?: EnrollmentStatus;
  userId?: string;
  programId?: string;
}

// API Error Types
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

