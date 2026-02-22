export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  team: string[];
  tags: string[];
  progress: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  team: string[];
  tags: string[];
}
