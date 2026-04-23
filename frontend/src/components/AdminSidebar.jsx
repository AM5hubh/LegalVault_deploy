import React from 'react';
import { 
  Users, 
  Database, 
  FileText, 
  Settings, 
  Shield, 
  Activity,
  BarChart3,
  Lock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Database Backup',
      href: '/admin/database-backup',
      icon: Database
    },
    {
      name: 'Security Logs',
      href: '/admin/security-logs',
      icon: Shield
    },
    {
      name: 'System Health',
      href: '/admin/system-health',
      icon: Activity
    },
    {
      name: 'Blog Management',
      href: '/admin/blogs',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="flex items-center space-x-2 mb-8">
        <Lock className="h-8 w-8 text-blue-400" />
        <h2 className="text-xl font-bold">LEGALVAULT Admin</h2>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Security Status</span>
        </div>
        <p className="text-xs text-gray-400">
          All admin operations are logged with immutable audit trails for compliance.
        </p>
      </div>
    </div>
  );
};

export default AdminSidebar;