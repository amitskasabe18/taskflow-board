import api from './api';
import { Project } from '@/types/project';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedProjects {
  projects: {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const projectService = {
  // Get user's projects
  getMyProjects: async (perPage = 100): Promise<Project[]> => {
    try {
      const response = await api.get<ApiResponse<PaginatedProjects>>(
        `/api/v1/projects/my?per_page=${perPage}`
      );
      
      if (response.data.success && response.data.data.projects) {
        // Transform backend data to frontend Project type
        return response.data.data.projects.data.map((project: any) => ({
          id: project.uuid || project.id,
          name: project.name,
          description: project.description || '',
          status: mapProjectStatus(project.status),
          priority: mapProjectPriority(project.priority),
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : undefined,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          owner: project.created_by?.name || 'Unknown',
          team: project.users?.map((user: any) => user.name).filter((name: string) => name) || [],
          tags: project.tags ? (typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags) : [],
          progress: calculateProgress(project),
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  },

  // Get all projects (for admin/organization view)
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get<ApiResponse<any>>('/api/v1/projects');
      
      if (response.data.success && response.data.data.projects) {
        return response.data.data.projects.map((project: any) => ({
          id: project.uuid || project.id,
          name: project.name,
          description: project.description || '',
          status: mapProjectStatus(project.status),
          priority: mapProjectPriority(project.priority),
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : undefined,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          owner: project.created_by?.name || 'Unknown',
          team: project.users?.map((user: any) => user.name).filter((name: string) => name) || [],
          tags: project.tags ? (typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags) : [],
          progress: calculateProgress(project),
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch all projects:', error);
      throw error;
    }
  },

  // Get single project by ID
  getProject: async (uuid: string): Promise<Project | null> => {
    try {
      const response = await api.get<ApiResponse<{ project: any }>>(
        `/api/v1/projects/${uuid}`
      );
      
      if (response.data.success && response.data.data.project) {
        const project = response.data.data.project;
        return {
          id: project.uuid || project.id,
          name: project.name,
          description: project.description || '',
          status: mapProjectStatus(project.status),
          priority: mapProjectPriority(project.priority),
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : undefined,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          owner: project.created_by?.name || 'Unknown',
          team: project.users?.map((user: any) => user.name).filter((name: string) => name) || [],
          tags: project.tags ? (typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags) : [],
          progress: calculateProgress(project),
        };
      }
      return null;
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData: any): Promise<Project> => {
    try {
      const response = await api.post<ApiResponse<{ project: any }>>(
        '/api/v1/projects',
        projectData
      );
      
      if (response.data.success && response.data.data.project) {
        const project = response.data.data.project;
        return {
          id: project.uuid || project.id,
          name: project.name,
          description: project.description || '',
          status: mapProjectStatus(project.status),
          priority: mapProjectPriority(project.priority),
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : undefined,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          owner: project.created_by?.name || 'Unknown',
          team: project.users?.map((user: any) => user.name).filter((name: string) => name) || [],
          tags: project.tags ? (typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags) : [],
          progress: 0,
        };
      }
      throw new Error('Failed to create project');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (uuid: string, updates: any): Promise<Project> => {
    try {
      const response = await api.put<ApiResponse<{ project: any }>>(
        `/api/v1/projects/${uuid}`,
        updates
      );
      
      if (response.data.success && response.data.data.project) {
        const project = response.data.data.project;
        return {
          id: project.uuid || project.id,
          name: project.name,
          description: project.description || '',
          status: mapProjectStatus(project.status),
          priority: mapProjectPriority(project.priority),
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : undefined,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          owner: project.created_by?.name || 'Unknown',
          team: project.users?.map((user: any) => user.name).filter((name: string) => name) || [],
          tags: project.tags ? (typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags) : [],
          progress: calculateProgress(project),
        };
      }
      throw new Error('Failed to update project');
    } catch (error: any) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (uuid: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/projects/${uuid}`);
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  // Join a project
  joinProject: async (uuid: string): Promise<void> => {
    try {
      await api.post(`/api/v1/projects/${uuid}/join`);
    } catch (error: any) {
      console.error('Failed to join project:', error);
      throw error;
    }
  },

  // Leave a project
  leaveProject: async (uuid: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/projects/${uuid}/leave`);
    } catch (error: any) {
      console.error('Failed to leave project:', error);
      throw error;
    }
  },

  // Get user's role in a project
  getUserRole: async (uuid: string): Promise<string> => {
    try {
      const response = await api.get<ApiResponse<{ role: string }>>(
        `/api/v1/projects/${uuid}/role`
      );
      return response.data.data.role || 'member';
    } catch (error: any) {
      console.error('Failed to get user role:', error);
      throw error;
    }
  },

  // Get project members
  getProjectMembers: async (uuid: string): Promise<{
    project: { uuid: string; name: string };
    members: Array<{
      id: number;
      uuid: string;
      name: string;
      first_name: string;
      last_name: string;
      email: string;
      profile_photo_path: string | null;
      role: string;
      joined_at: string;
      is_current_user: boolean;
      is_project_owner: boolean;
    }>;
    total_members: number;
    current_user_role: string | null;
  }> => {
    try {
      const response = await api.get<ApiResponse<{
        project: { uuid: string; name: string };
        members: any[];
        total_members: number;
        current_user_role: string | null;
      }>>(`/api/v1/projects/${uuid}/members`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get project members:', error);
      throw error;
    }
  },
};

// Helper functions
function mapProjectStatus(status: string): 'active' | 'completed' | 'archived' {
  const statusMap: Record<string, 'active' | 'completed' | 'archived'> = {
    'active': 'active',
    'in-progress': 'active',
    'completed': 'completed',
    'done': 'completed',
    'archived': 'archived',
    'closed': 'archived',
  };
  return statusMap[status?.toLowerCase()] || 'active';
}

function mapProjectPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'critical',
  };
  return priorityMap[priority?.toLowerCase()] || 'medium';
}

function calculateProgress(project: any): number {
  // If progress is provided by backend, use it
  if (project.progress !== undefined && project.progress !== null) {
    return Number(project.progress);
  }
  
  // Default to 0 for new projects
  if (project.status === 'completed' || project.status === 'done') {
    return 100;
  }
  
  return 0;
}
