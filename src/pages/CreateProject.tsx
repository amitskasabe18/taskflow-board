import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Project {
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
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const CreateProject: React.FC = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    shortcode: '',
    description: '',
    status: 'active',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'USD',
    team_members: [] as number[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    const newTeamMembers = [...formData.team_members];
    if (value) {
      const userId = parseInt(value);
      if (!isNaN(userId) && !newTeamMembers.includes(userId)) {
        newTeamMembers[index] = userId;
      }
    } else {
      newTeamMembers[index] = undefined;
    }
    setFormData(prev => ({
      ...prev,
      team_members: newTeamMembers
    }));
  };

  const addTeamMemberField = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, undefined]
    }));
  };

  const removeTeamMemberField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          shortcode: formData.shortcode,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          currency: formData.currency,
          team_members: formData.team_members.filter(id => id !== undefined)
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Project created successfully!');
        setFormData({
          name: '',
          shortcode: '',
          description: '',
          status: 'active',
          priority: 'medium',
          start_date: '',
          end_date: '',
          budget: '',
          currency: 'USD',
          team_members: []
        });
      } else {
        setError(result.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800' : 'from-blue-50 via-indigo-100'} p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create New Project
              </h2>
              <p className={`text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Set up a new project and invite team members
              </p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Enter project name"
                  />
                </div>

                {/* Shortcode */}
                <div>
                  <label htmlFor="shortcode" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Shortcode
                  </label>
                  <input
                    type="text"
                    id="shortcode"
                    name="shortcode"
                    value={formData.shortcode}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Enter project shortcode (optional)"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Describe your project"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => handleSelectChange('priority', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="start_date" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="end_date" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="budget" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Budget
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className={`text-gray-500 sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    </div>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      step="0.01"
                      className={`block w-full pl-7 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label htmlFor="currency" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => handleSelectChange('currency', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              {/* Team Members */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Team Members
                  </h3>
                  <button
                    type="button"
                    onClick={addTeamMemberField}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    Add Team Member
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.team_members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={member || ''}
                          onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                          placeholder="Enter user ID"
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMemberField(index)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 text-base font-medium rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
