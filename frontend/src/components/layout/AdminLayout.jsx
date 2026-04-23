import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Database, 
  Shield, 
  BarChart3, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Scale,
  Home,
  Activity,
  CheckSquare,
  FileWarning
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: Home },
    { name: 'User Management', href: '/admin/users-management', icon: Users },
    { name: 'Role Requests', href: '/admin/role-requests', icon: CheckSquare },
    { name: 'Contact Messages', href: '/admin/contact-management', icon: MessageSquare },
    { name: 'Blog Management', href: '/admin/blog-management', icon: BookOpen },
    { name: 'API Status', href: '/admin/api-status', icon: Activity },
    { name: 'Evidence Monitor', href: '/admin/evidence', icon: FileText },
    { name: 'Evidence Verification', href: '/admin/evidence-verification', icon: FileWarning },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'Security Audit', href: '/admin/security', icon: Shield },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Database Backup', href: '/admin/backup', icon: Database },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
    const handleback = () => {
    navigate('/dashboard');
    }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} handleLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="flex items-center h-16">
                    <h1 className="text-lg font-semibold text-gray-900">LEGALVAULT Admin Panel</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm text-gray-700 mr-4">Administrator</span>
              <button
                onClick={handleback}
                className="bg-red-600 p-1 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, handleLogout }) => (
  <div className="flex flex-col h-full bg-gray-800">
    {/* Logo */}
    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
      <div className="flex items-center">
        <Scale className="h-8 w-8 text-orange-500" />
        <span className="ml-2 text-white font-bold text-lg">LEGALVAULT</span>
      </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-orange-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-orange-500">
      <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-orange-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>

    {/* User info and logout */}
    <div className="flex-shrink-0 flex bg-gray-700 p-4">
      <div className="flex items-center w-full">
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-white">Admin User</p>
          <p className="text-xs text-gray-300">admin@legalvault.gov.in</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);

export default AdminLayout;