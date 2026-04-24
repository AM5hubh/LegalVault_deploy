import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Scale,
  FileText,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Loader,
  AlertCircle,
  Plus,
  Shield,
  Home,
  Users,
  Briefcase,
  ShoppingCart,
  Building,
} from 'lucide-react';

const MyCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
  });

  useEffect(() => {
    fetchCases();
    fetchStats();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/cases/my-cases',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCases(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/cases/my-stats',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const categories = {
    criminal: { icon: Shield, color: 'red', label: 'Criminal' },
    civil: { icon: Scale, color: 'blue', label: 'Civil' },
    cyber: { icon: AlertCircle, color: 'purple', label: 'Cyber' },
    property: { icon: Home, color: 'green', label: 'Property' },
    family: { icon: Users, color: 'pink', label: 'Family' },
    corporate: { icon: Building, color: 'indigo', label: 'Corporate' },
    labor: { icon: Briefcase, color: 'orange', label: 'Labor' },
    consumer: { icon: ShoppingCart, color: 'teal', label: 'Consumer' },
  };

  const statusColors = {
    pending_analysis: 'bg-yellow-100 text-yellow-800',
    analyzed: 'bg-blue-100 text-blue-800',
    lawyer_contacted: 'bg-purple-100 text-purple-800',
    case_filed: 'bg-green-100 text-green-800',
    under_investigation: 'bg-orange-100 text-orange-800',
    in_court: 'bg-red-100 text-red-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  const filteredCases = cases.filter((caseItem) => {
    if (filters.status !== 'all' && caseItem.status !== filters.status) return false;
    if (filters.category !== 'all' && caseItem.incidentCategory !== filters.category) return false;
    if (filters.search && !caseItem.caseTitle.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Legal Cases</h1>
              <p className="text-gray-600">Track and manage your legal cases</p>
            </div>
            <button
              onClick={() => navigate('/file-case')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>File New Case</span>
            </button>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Cases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.byStatus?.pending_analysis || 0}</p>
                  </div>
                  <Loader className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Analyzed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.byStatus?.analyzed || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">In Court</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.byStatus?.in_court || 0}</p>
                  </div>
                  <Scale className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_analysis">Pending Analysis</option>
                <option value="analyzed">Analyzed</option>
                <option value="lawyer_contacted">Lawyer Contacted</option>
                <option value="case_filed">Case Filed</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="in_court">In Court</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="criminal">Criminal</option>
                <option value="civil">Civil</option>
                <option value="cyber">Cyber Crime</option>
                <option value="property">Property</option>
                <option value="family">Family</option>
                <option value="corporate">Corporate</option>
                <option value="labor">Labor</option>
                <option value="consumer">Consumer</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all' || filters.category !== 'all'
                ? 'Try adjusting your filters'
                : 'File your first legal case to get started'}
            </p>
            <button
              onClick={() => navigate('/file-case')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              File New Case
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCases.map((caseItem) => {
              const categoryInfo = categories[caseItem.incidentCategory] || categories.civil;
              const Icon = categoryInfo.icon;
              
              return (
                <div
                  key={caseItem._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border-2 border-transparent hover:border-orange-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-14 h-14 bg-${categoryInfo.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-8 h-8 text-${categoryInfo.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{caseItem.caseTitle}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {caseItem.caseDescription}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[caseItem.status] || statusColors.analyzed}`}>
                              {caseItem.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 border-2 rounded-full text-xs font-medium ${severityColors[caseItem.analysis?.classification?.severityLevel || 'medium']}`}>
                              {caseItem.analysis?.classification?.severityLevel?.toUpperCase() || 'MEDIUM'} SEVERITY
                            </span>
                            {caseItem.analysis?.applicableSections?.length > 0 && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {caseItem.analysis.applicableSections.length} Sections
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(caseItem.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            {caseItem.analysis?.confidenceScore && (
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {caseItem.analysis.confidenceScore}% Confidence
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/case-report/${caseItem._id}`)}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors ml-4 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCases;
