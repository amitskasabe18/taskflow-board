import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { isDark } = useTheme();

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return `${user.first_name} ${user.last_name}`;
  };

  const getUserInitials = () => {
    if (!user) return 'G';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      active: window.location.pathname === '/dashboard',
    },
    {
      name: 'Projects',
      icon: '📁',
      path: '/projects',
      active: window.location.pathname === '/projects',
    },
    {
      name: 'Create Project',
      icon: '➕',
      path: '/projects/create',
      active: window.location.pathname === '/projects/create',
    },
    {
      name: 'Settings',
      icon: '⚙️',
      path: '/settings',
      active: window.location.pathname === '/settings',
    },
  ];

  if (isLoading) {
    return (
      <div className={`w-64 h-full ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`w-64 h-full ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* User Profile Section */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
            {user?.profile_photo_path ? (
              <img 
                src={user.profile_photo_path} 
                alt={getUserDisplayName()}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getUserInitials()
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getUserDisplayName()}
            </p>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.email || 'guest@example.com'}
            </p>
            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
              {user?.role || 'guest'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              item.active
                ? isDark 
                  ? 'bg-indigo-900 text-indigo-200' 
                  : 'bg-indigo-50 text-indigo-700'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Organization Info */}
      {user?.organisation_id && (
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Organization ID: {user.organisation_id}</p>
            <p>User ID: {user.id}</p>
          </div>
        </div>
      )}

      {/* Mobile Close Button */}
      {onClose && (
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} lg:hidden`}>
          <button
            onClick={onClose}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Close Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
