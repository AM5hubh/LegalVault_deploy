import React, { useState, useEffect } from 'react';
import { Scale, FileText, Clock, CheckCircle, Eye, Download, BookOpen, Search, Gavel, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lawyerStats, setLawyerStats] = useState({
    assignedCases: 0,
    reviewsPending: 0,
    evidenceAccessed: 0,
    completedReviews: 0,
  });
  const [cases, setCases] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Removed dummy data setting; stats remain at initial values (0)
    // In a real app, fetch real data from an API here
  }, []);

  const handleNavigateToLegalActs = () => {
    navigate('/lawyer/law-penal');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Counsel Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name || 'Lawyer'} - Review evidence and manage legal proceedings
          </p>
        </div>

        {/* Lawyer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{lawyerStats.assignedCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reviews Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{lawyerStats.reviewsPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evidence Accessed</p>
                <p className="text-2xl font-semibold text-gray-900">{lawyerStats.evidenceAccessed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{lawyerStats.completedReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleNavigateToLegalActs}
                className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-orange-500">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-900">Legal Acts & Codes</p>
                  <p className="text-sm text-gray-600">Browse IPC, CrPC, CPC & more</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/lawyer/cases')}
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-blue-500">
                  <Gavel className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-900">Manage Cases</p>
                  <p className="text-sm text-gray-600">View & manage your cases</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/lawyer/evidence')}
                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-green-500">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-900">Evidence Review</p>
                  <p className="text-sm text-gray-600">Access case evidence</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/lawyer/search')}
                className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-purple-500">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-900">Legal Research</p>
                  <p className="text-sm text-gray-600">Search legal precedents</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Cases and Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cases Requiring Review */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cases Requiring Review</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {cases.length === 0 ? (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No cases requiring review at this time.</p>
                    <button
                      onClick={() => navigate('/lawyer/cases')}
                      className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View All Cases
                    </button>
                  </div>
                ) : (
                  cases.map((case_item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">Case #{case_item.id}</h4>
                        <p className="text-sm text-gray-600">{case_item.title}</p>
                        <p className="text-xs text-gray-500">{case_item.deadline}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            case_item.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : case_item.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {case_item.priority}
                        </span>
                        <button className="p-1 text-orange-600 hover:text-orange-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recently Accessed Evidence */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recently Accessed Evidence</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {evidenceList.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recently accessed evidence.</p>
                    <button
                      onClick={() => navigate('/lawyer/evidence')}
                      className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Browse Evidence
                    </button>
                  </div>
                ) : (
                  evidenceList.map((evidence, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{evidence.name}</p>
                          <p className="text-sm text-gray-500">
                            Case #{evidence.case} • {evidence.accessed}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 text-orange-600 hover:text-orange-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
{/* Legal Resources Section */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow border border-orange-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">LEGALVAULT Resources</h3>
                <p className="text-gray-600 mb-4">
                  Access comprehensive Indian legal acts, codes, and provisions for your legal research and case preparation.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    IPC 1860
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    CrPC 1973
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    CPC 1908
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    Evidence Act 1872
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    +4 more
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleNavigateToLegalActs}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Browse Legal Acts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity logged.</p>
                <p className="text-sm text-gray-400 mt-2">Your legal research and case activities will appear here.</p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default LawyerDashboard;