import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, CreateProjectData } from '@/types/project';
import { projectService } from '@/services/projectService';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetchProjects: () => Promise<void>;
  createProject: (projectData: CreateProjectData) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    refetchProjects();
  }, []);

  const refetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await projectService.getMyProjects();
      setProjects(fetchedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setProjects([]); // Clear projects on error
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: CreateProjectData) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: projectData.name,
        description: projectData.description,
        priority: projectData.priority,
        start_date: projectData.startDate.toISOString().split('T')[0],
        end_date: projectData.endDate?.toISOString().split('T')[0],
        tags: JSON.stringify(projectData.tags),
        shortcode: projectData.shortcode,
      };

      const newProject = await projectService.createProject(backendData);
      setProjects(prev => [...prev, newProject]);
      return newProject; // Return the created project
    } catch (err: any) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      // Transform frontend data to backend format
      const backendUpdates: any = {};
      if (updates.name) backendUpdates.name = updates.name;
      if (updates.description) backendUpdates.description = updates.description;
      if (updates.priority) backendUpdates.priority = updates.priority;
      if (updates.status) backendUpdates.status = updates.status;
      if (updates.startDate) backendUpdates.start_date = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate) backendUpdates.end_date = updates.endDate.toISOString().split('T')[0];
      if (updates.tags) backendUpdates.tags = JSON.stringify(updates.tags);
      if (updates.shortcode !== undefined) backendUpdates.shortcode = updates.shortcode;

      const updatedProject = await projectService.updateProject(id, backendUpdates);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
    } catch (err: any) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err: any) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      error,
      refetchProjects,
      createProject,
      updateProject,
      deleteProject,
      getProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
