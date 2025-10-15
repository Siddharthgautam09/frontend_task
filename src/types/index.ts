// User types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  profilePicture?: string;
  department?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEAM_MEMBER = 'team_member',
}

// Project types
export interface Project {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  managerId: User | string;
  teamMembers: User[] | string[];
  budget?: number;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: Project | string;
  assignedTo?: User | string;
  createdBy: User | string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  dependencies: Task[] | string[];
  comments: TaskComment[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export interface TaskComment {
  userId: User | string;
  comment: string;
  createdAt: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  department?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    projects?: T[];  // For project API responses
    items?: T[];     // For other API responses
    tasks?: T[];     // For task API responses
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProjects?: number;
      totalTasks?: number;
      limit: number;
    };
  };
}

// Analytics types
export interface DashboardAnalytics {
  overview: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  projectStats: {
    _id: ProjectStatus;
    count: number;
    totalBudget?: number;
  }[];
  taskStats: {
    _id: TaskStatus;
    count: number;
    totalEstimatedHours?: number;
    totalActualHours?: number;
  }[];
  priorityStats: {
    _id: TaskPriority;
    count: number;
  }[];
  teamWorkload: TeamMember[];
  recentActivity: Task[];
}

export interface TeamMember {
  userId: string;
  userName: string;
  userEmail: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionRate: number;
}

// Form types
export interface ProjectFormData {
  title: string;
  description: string;
  deadline: string;
  priority: ProjectPriority;
  status?: ProjectStatus;
  managerId: string;
  teamMembers: string[];
  budget?: number;
  estimatedHours?: number;
  tags: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assignedTo?: string;
  dueDate: string;
  priority: TaskPriority;
  status?: TaskStatus;
  estimatedHours?: number;
  tags: string[];
  dependencies: string[];
}

// Filter types
export interface ProjectFilters extends PaginationParams {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  managerId?: string;
  search?: string;
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignedTo?: string;
  createdBy?: string;
  search?: string;
  overdue?: boolean;
}