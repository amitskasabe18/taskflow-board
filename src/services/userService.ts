import api from './api';

export interface Role {
  id: number;
  name: string;
  slug: string;
  status: string;
}

export interface Designation {
  id: number;
  name: string;
  slug: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  // Get all available roles
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get<ApiResponse<Role[]>>('/api/v1/users/roles');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch roles');
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  },

  // Get all available designations (job titles)
  getDesignations: async (): Promise<Designation[]> => {
    try {
      const response = await api.get<ApiResponse<Designation[]>>('/api/v1/designations');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch designations');
    } catch (error) {
      console.error('Failed to fetch designations:', error);
      throw error;
    }
  },
};
