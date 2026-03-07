import api from './api';

export interface CreateTicketRequest {
  title: string;
  description?: string;
  type: 'task' | 'bug' | 'story' | 'epic' | 'subtask' | 'improvement';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  project_id: number | string; // Accept both numeric ID and UUID
  assignee_id?: number;
  sprint_id?: number;
  parent_id?: number;
  story_points?: number;
  original_estimate_minutes?: number;
  due_date?: string;
  start_date?: string;
  labels?: number[];
  watchers?: number[];
}

export interface Ticket {
  id: number;
  uuid: string;
  key: string;
  key_sequence: number;
  title: string;
  description?: string;
  type: string;
  priority: string;
  resolution_status?: string;
  status_id: number;
  project_id: number;
  reporter_id: number;
  assignee_id?: number;
  sprint_id?: number;
  parent_id?: number;
  story_points?: number;
  original_estimate_minutes?: number;
  remaining_estimate_minutes?: number;
  due_date?: string;
  start_date?: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_note?: string;
  environment?: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  project: {
    id: number;
    name: string;
    key: string;
  };
  status: {
    id: number;
    name: string;
    slug: string;
    color: string;
    category: string;
  };
  reporter: {
    id: number;
    name: string;
    email: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  sprint?: {
    id: number;
    name: string;
  };
  parent?: {
    id: number;
    title: string;
    key: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  watchers: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  data: {
    ticket: Ticket;
  };
}

export interface ProjectTicketsResponse {
  success: boolean;
  message: string;
  data: {
    tickets: Ticket[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
      has_more_pages: boolean;
    };
    filters: {
      status?: string;
      type?: string;
      priority?: string;
      assignee?: string;
      sprint?: string;
      search?: string;
      include_archived?: boolean;
      sort_by: string;
      sort_order: string;
    };
    metrics: {
      total_count: number;
      active_count: number;
      archived_count: number;
      by_status: Record<string, number>;
      by_type: Record<string, number>;
      by_priority: Record<string, number>;
    };
  };
}

export interface ProjectTicketsFilters {
  status?: string;
  type?: string;
  priority?: string;
  assignee?: string;
  sprint?: string;
  search?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include_archived?: boolean;
}

export interface TicketDetailResponse {
  success: boolean;
  message: string;
  data: {
    ticket: DetailedTicket;
    related_tickets: {
      parent?: Ticket;
      siblings?: Ticket[];
      subtasks?: Ticket[];
    };
    metrics: {
      time_spent_minutes: number;
      time_spent_hours: number;
      comments_count: number;
      attachments_count: number;
      watchers_count: number;
      subtasks_count: number;
    };
  };
}

export interface DetailedTicket extends Ticket {
  time_spent_minutes: number;
  time_spent_hours: number;
  comments_count: number;
  attachments_count: number;
  watchers_count: number;
  subtasks_count: number;
  children: Ticket[];
  timeLogs: Array<{
    id: number;
    minutes: number;
    description?: string;
    date: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    created_at: string;
  }>;
  comments: Array<{
    id: number;
    content: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    created_at: string;
  }>;
  attachments: Array<{
    id: number;
    filename: string;
    original_filename: string;
    mime_type: string;
    size: number;
    path: string;
    uploader: {
      id: number;
      name: string;
      email: string;
    };
    created_at: string;
  }>;
  history: Array<{
    id: number;
    field_name: string;
    old_value?: string;
    new_value?: string;
    change_type: string;
    changed_at: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  linkedTickets: Array<{
    id: number;
    title: string;
    key: string;
    pivot: {
      type: string;
      created_by: number;
    };
  }>;
}

export const ticketService = {
  /**
   * Create a new ticket
   */
  async createTicket(ticketData: CreateTicketRequest): Promise<CreateTicketResponse> {
    try {
      const response = await api.post('/api/v1/tickets', ticketData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      } else {
        throw new Error('Failed to create ticket. Please try again.');
      }
    }
  },

  /**
   * Create a new ticket for a specific project
   */
  async createProjectTicket(projectId: string, ticketData: CreateTicketRequest): Promise<CreateTicketResponse> {
    try {
      const response = await api.post(`/api/v1/projects/${projectId}/tickets`, ticketData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create project ticket:', error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      } else {
        throw new Error('Failed to create project ticket. Please try again.');
      }
    }
  },

  /**
   * Get users for a specific project
   */
  async getProjectUsers(projectId: string): Promise<any> {
    try {
      const response = await api.get(`/api/v1/users/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch project users:', error);
      throw new Error('Failed to fetch project users. Please try again.');
    }
  },

  /**
   * Get tickets for a project with filtering and pagination
   */
  async getProjectTickets(projectId: string, filters?: ProjectTicketsFilters): Promise<ProjectTicketsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const queryString = params.toString();
      const url = `/api/v1/projects/${projectId}/tickets${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch project tickets:', error);
      throw new Error('Failed to fetch tickets. Please try again.');
    }
  },

  /**
   * Get a single ticket by UUID with full details
   */
  async getTicket(ticketUuid: string): Promise<TicketDetailResponse> {
    try {
      const response = await api.get(`/api/v1/tickets/${ticketUuid}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch ticket:', error);
      throw new Error('Failed to fetch ticket. Please try again.');
    }
  },

  /**
   * Create a new ticket for a specific project with attachments
   */
  async createProjectTicketWithAttachments(projectId: string, formData: FormData): Promise<CreateTicketResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await api.post(`/api/v1/projects/${projectId}/tickets`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating project ticket with attachments:', error);
      throw error;
    }
  },

  /**
   * Update a ticket
   */
  async updateTicket(ticketId: number, ticketData: Partial<CreateTicketRequest>): Promise<CreateTicketResponse> {
    try {
      const response = await api.put(`/api/v1/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      } else {
        throw new Error('Failed to update ticket. Please try again.');
      }
    }
  },

  /**
   * Delete a ticket
   */
  async deleteTicket(ticketId: number): Promise<void> {
    try {
      await api.delete(`/api/v1/tickets/${ticketId}`);
    } catch (error: any) {
      console.error('Failed to delete ticket:', error);
      throw new Error('Failed to delete ticket. Please try again.');
    }
  },

  /**
   * Assign a ticket to a user
   */
  async assignTicket(ticketId: number, userId: number): Promise<void> {
    try {
      await api.post(`/api/v1/tickets/${ticketId}/assign`, { user_id: userId });
    } catch (error: any) {
      console.error('Failed to assign ticket:', error);
      throw new Error('Failed to assign ticket. Please try again.');
    }
  },

  /**
   * Add a user to ticket watchers
   */
  async addTicketWatcher(ticketId: number, userId: number): Promise<void> {
    try {
      await api.post(`/api/v1/tickets/${ticketId}/watch`, { user_id: userId });
    } catch (error: any) {
      console.error('Failed to add watcher:', error);
      throw new Error('Failed to add watcher. Please try again.');
    }
  },

  /**
   * Remove a user from ticket watchers
   */
  async removeTicketWatcher(ticketId: number, userId: number): Promise<void> {
    try {
      await api.post(`/api/v1/tickets/${ticketId}/unwatch`, { user_id: userId });
    } catch (error: any) {
      console.error('Failed to remove watcher:', error);
      throw new Error('Failed to remove watcher. Please try again.');
    }
  },
};
