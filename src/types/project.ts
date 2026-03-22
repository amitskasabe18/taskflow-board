export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: number;
  joined_at: string;
  profile_photo_path?: string;
}

export interface Project {
  id: number;
  uuid: string;
  name: string;
  shortcode?: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  metadata?: any;
  organisation_id: number;
  created_by: {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: number;
    organisation_id: number;
    profile_photo_path?: string;
    created_at: string;
    updated_at: string;
  };

export interface CreateProjectData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  team: string[];
  tags: string[];
  shortcode?: string;
}
