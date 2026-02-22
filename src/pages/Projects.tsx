import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProjectCard from '../components/ProjectCard';

interface Project {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  created_at: string;
  updated_at: string;
  user_role?: string;
  user_joined_at?: string;
}

const Projects: React.FC = () => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/projects/my', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setProjects(result.data.projects.data || []);
      } else {
        setError(result.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async (uuid: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/v1/projects/${uuid}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Successfully joined the project!');
        fetchProjects(); // Refresh the list
      } else {
        setError(result.message || 'Failed to join project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleLeaveProject = async (uuid: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/v1/projects/${uuid}/leave`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Successfully left the project!');
        fetchProjects(); // Refresh the list
      } else {
        setError(result.message || 'Failed to leave project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800' : 'from-blue-50 via-indigo-100'} p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Projects
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your projects and team collaborations
            </p>
          </div>
          
          <a
            href="/projects/create"
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Create New Project
          </a>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 rounded-lg">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              📁
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              No projects yet
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Get started by creating your first project
            </p>
            <a
              href="/projects/create"
              className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              Create Your First Project
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.uuid}
                project={project}
                onJoin={handleJoinProject}
                onLeave={handleLeaveProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
