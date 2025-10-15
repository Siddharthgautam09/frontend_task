import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Project,
  Task,
  DashboardAnalytics,
  ProjectFormData,
  TaskFormData,
  ProjectFilters,
  TaskFilters,
  PaginatedResponse,
} from '@/types';

class ApiClient {
  // Fetch all active users
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await this.client.get<ApiResponse<User[]>>('/users');
    return response.data;
  }
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    console.log('🔗 API Base URL:', `${apiUrl}/api`); // Debug log
    
    this.client = axios.create({
      baseURL: `${apiUrl}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from cookies on initialization
    this.accessToken = Cookies.get('accessToken') || null;
    
    // Set up request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Set up response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setTokens(response.data.accessToken, response.data.refreshToken);
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }

        // Show error toast for non-401 errors
        if (error.response?.status !== 401) {
          const message = error.response?.data?.message || 'An error occurred';
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
  }

  private clearTokens(): void {
    this.accessToken = null;
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    const { accessToken, refreshToken } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ data: { accessToken: string; refreshToken: string } }> {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>('/auth/change-password', data);
    return response.data;
  }

  // Project methods
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await this.client.get<PaginatedResponse<Project>>(`/projects?${params}`);
    return response.data;
  }

  async getProject(id: string): Promise<ApiResponse<{ project: Project; tasks: Task[] }>> {
    const response = await this.client.get<ApiResponse<{ project: Project; tasks: Task[] }>>(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: ProjectFormData): Promise<ApiResponse<{ project: Project }>> {
    const response = await this.client.post<ApiResponse<{ project: Project }>>('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<ApiResponse<{ project: Project }>> {
    const response = await this.client.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/projects/${id}`);
    return response.data;
  }

  async getProjectStats(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.get<ApiResponse<any>>(`/projects/${id}/stats`);
    return response.data;
  }

  // Task methods
  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await this.client.get<PaginatedResponse<Task>>(`/tasks?${params}`);
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<{ task: Task }>> {
    const response = await this.client.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: TaskFormData): Promise<ApiResponse<{ task: Task }>> {
    const response = await this.client.post<ApiResponse<{ task: Task }>>('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<ApiResponse<{ task: Task }>> {
    const response = await this.client.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/tasks/${id}`);
    return response.data;
  }

  async addTaskComment(id: string, comment: string): Promise<ApiResponse<{ comment: any }>> {
    const response = await this.client.post<ApiResponse<{ comment: any }>>(`/tasks/${id}/comments`, { comment });
    return response.data;
  }

  async getMyTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await this.client.get<PaginatedResponse<Task>>(`/tasks/my-tasks?${params}`);
    return response.data;
  }

  // Analytics methods
  async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
    const response = await this.client.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard');
    return response.data;
  }

  async getProjectAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.client.get<ApiResponse<any>>(`/analytics/projects?${params}`);
    return response.data;
  }

  async getTeamAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.client.get<ApiResponse<any>>(`/analytics/team?${params}`);
    return response.data;
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;