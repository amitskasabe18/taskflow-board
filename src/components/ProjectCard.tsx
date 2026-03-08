import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

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

interface ProjectCardProps {
  project: Project;
  onJoin?: (uuid: string) => void;
  onLeave?: (uuid: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onJoin, onLeave }) => {
  const { isDark } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-blue-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      case 'archived': return 'text-gray-500';
      case 'on_hold': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager': return { color: 'bg-purple-100 text-purple-800', label: 'Manager' };
      case 'lead': return { color: 'bg-blue-100 text-blue-800', label: 'Lead' };
      case 'member': return { color: 'bg-green-100 text-green-800', label: 'Member' };
      case 'viewer': return { color: 'bg-gray-100 text-gray-800', label: 'Viewer' };
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Member' };
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${project.name ? 'mb-2' : ''}`}>
            {project.name || 'Untitled Project'}
          </h3>
          
          {project.description && (
            <p className={`text-sm text-gray-600 dark:text-gray-300 mt-2 ${project.name ? 'mb-4' : ''}`}>
              {project.description}
            </p>
          )}

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Priority:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
            </div>

            {project.budget && (
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Budget:</span>
                <span className={`ml-2 text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {project.currency} {project.budget?.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {project.start_date && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Start:</span>
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {project.end_date && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>End:</span>
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          {project.user_role && (
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(project.user_role).color}`}>
              {getRoleBadge(project.user_role).label}
            </div>
          )}
          
          {project.user_joined_at && (
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Joined {new Date(project.user_joined_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {onJoin && (
        <button
          onClick={() => onJoin(project.uuid)}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          Join Project
        </button>
      )}

      {onLeave && ( 
        <button
          onClick={() => onLeave(project.uuid)}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Leave Project
        </button>
      )}
    </div>
  );
};

export default ProjectCard;
