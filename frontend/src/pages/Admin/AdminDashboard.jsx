import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Shield, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    pendingKyc: 0,
    totalCases: 0,
    evidenceCount: 0,
    contactMessages: 0,
    newContactMessages: 0,
    blogPosts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      
      const token = localStorage.getItem('token');
      
      // Fetch users count
      try {
        const usersResponse = await fetch('http://localhost:5000/api/auth/users?page=1&limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setAdminStats(prev => ({
            ...prev,
            totalUsers: usersData.total || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching users count:', error);
      }

      // Fetch contact messages count
      try {
        const contactResponse = await fetch('http://localhost:5000/api/contact', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          setAdminStats(prev => ({
            ...prev,
            contactMessages: contactData.contacts?.length || 0,
            newContactMessages: contactData.stats?.new || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching contact stats:', error);
      }

      // Fetch blog posts count
      try {
        const blogResponse = await fetch('http://localhost:5000/api/blogs/admin/all?page=1&limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          setAdminStats(prev => ({
            ...prev,
            blogPosts: blogData.total || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching blog stats:', error);
      }

      // TODO: Fetch other stats from respective APIs
      setAdminStats(prev => ({
        ...prev,
        pendingKyc: 0,
        totalCases: 0,
        evidenceCount: 0
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: adminStats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${adminStats.totalUsers > 0 ? '12' : '0'}%`,
      link: '/admin/users-management'
    },
    {
      title: 'Pending KYC',
      value: adminStats.pendingKyc,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '+0%',
      link: '/admin/users-management'
    },
    {
      title: 'Active Cases',
      value: adminStats.totalCases,
      icon: FileText,
      color: 'bg-green-500',
      change: '+0%',
      link: '/admin/evidence'
    },
    {
      title: 'Evidence Files',
      value: adminStats.evidenceCount,
      icon: Shield,
      color: 'bg-purple-500',
      change: '+0%',
      link: '/admin/evidence'
    },
    {
      title: 'Contact Messages',
      value: adminStats.contactMessages,
      icon: MessageSquare,
      color: 'bg-red-500',
      change: adminStats.newContactMessages > 0 ? `+${adminStats.newContactMessages} new` : '+0%',
      link: '/admin/contact-management',
      notification: adminStats.newContactMessages > 0
    },
    {
      title: 'Blog Posts',
      value: adminStats.blogPosts,
      icon: BookOpen,
      color: 'bg-indigo-500',
      change: '+0%',
      link: '/admin/blog-management'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.fullName || user?.email}! Here's what's happening with LEGALVAULT.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  {stat.notification && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      New
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className={stat.notification ? "text-red-600" : "text-green-600"}>
                    {stat.change}
                  </span> from last month
                </p>
                {stat.link && (
                  <a 
                    href={stat.link}
                    className="text-sm text-orange-600 hover:text-orange-700 mt-2 inline-block"
                  >
                    View details →
                  </a>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-full relative`}>
                <stat.icon className="h-6 w-6 text-white" />
                {stat.notification && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a 
              href="/admin/users-management"
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium">Manage Users</span>
                <span className="ml-auto text-sm text-gray-500">({adminStats.totalUsers})</span>
              </div>
            </a>
            <a 
              href="/admin/contact-management"
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors block relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium">Review Contact Messages</span>
                </div>
                {adminStats.newContactMessages > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {adminStats.newContactMessages} new
                  </span>
                )}
              </div>
            </a>
            <a 
              href="/admin/blog-management"
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Manage Blog Posts</span>
              </div>
            </a>
            <a 
              href="/admin/api-status"
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium">API Status</span>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">Database</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">Blockchain</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">API Status</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contact Messages */}
      {adminStats.contactMessages > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contact Messages</h3>
            <a 
              href="/admin/contact-management"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              View all →
            </a>
          </div>
          <div className="text-center py-4 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              You have {adminStats.contactMessages} total contact messages
              {adminStats.newContactMessages > 0 && (
                <span className="text-red-600 font-medium">
                  {' '}({adminStats.newContactMessages} new)
                </span>
              )}
            </p>
            <a 
              href="/admin/contact-management"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 inline-block"
            >
              Manage Messages
            </a>
          </div>
        </div>
      )}

      {/* No Activity State */}
      {adminStats.contactMessages === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display</p>
            <p className="text-sm">System activity will appear here once users start interacting with the platform</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;