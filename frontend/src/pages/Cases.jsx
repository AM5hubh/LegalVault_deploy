import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  FileText, 
  Plus, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Scale,
  User,
  Clock
} from "lucide-react";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("section 377");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [note, setNote] = useState('');

  const casesPerPage = 20;

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchCases();
    }
  }, [searchTerm, currentPage]);

  const fetchCases = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setNote('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/cases/search?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${casesPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCases(data.cases || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCases(data.pagination?.totalCases || 0);
        setNote(data.note || '');
      } else {
        throw new Error(data.message || 'Failed to fetch cases');
      }
      
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError(`Failed to fetch cases: ${error.message}`);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCases();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return statusConfig[status] || statusConfig.active;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800", 
      low: "bg-blue-100 text-blue-800",
    };
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const filteredCases = cases.filter(caseItem => {
    if (filterStatus === 'all') return true;
    return caseItem.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal Case Search</h1>
              <p className="text-gray-600">Search and explore legal cases from Indian courts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search legal cases (e.g., 'section 377', 'constitutional law', 'contract dispute')..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    className="border rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Status and Info */}
          {note && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm">{note}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Results Header */}
        {!loading && cases.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results for "{searchTerm}"
              </h2>
              <p className="text-gray-600">
                Showing {filteredCases.length} of {totalCases} cases (Page {currentPage} of {totalPages})
              </p>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching legal cases...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch the results</p>
            </div>
          </div>
        )}

        {/* Cases Grid */}
        {!loading && filteredCases.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2 line-clamp-2">
                    {caseItem.title}
                  </h3>
                  <div className="flex flex-col space-y-1 ml-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(
                        caseItem.priority
                      )}`}
                    >
                      {caseItem.priority}
                    </span>
                  </div>
                </div>

                {/* Citation and Court */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-600">{caseItem.citation}</p>
                  <p className="text-sm text-gray-600">{caseItem.court}</p>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {caseItem.description}
                </p>

                {/* Case Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Date: {new Date(caseItem.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Evidence: {caseItem.evidenceCount} items</span>
                  </div>
                  {caseItem.assignedTo !== 'Unassigned' && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Judge: {caseItem.assignedTo}</span>
                    </div>
                  )}
                  {caseItem.nextHearing && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Next: {new Date(caseItem.nextHearing).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {caseItem.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseItem.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      Score: {caseItem.score}%
                    </span>
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(caseItem.lastUpdate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm">
                      
                    </button>
                    {caseItem.url && caseItem.url !== '#' && (
                      <a
                        href={caseItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>External</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = Math.max(1, currentPage - 2) + idx;
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        pageNum === currentPage
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCases.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <Scale className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms or filters to find relevant cases.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['section 377', 'dowry harassment', 'contract law', 'property dispute', 'constitutional law'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!searchTerm && !loading && (
          <div className="text-center py-16">
            <Scale className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Legal Cases</h3>
            <p className="text-gray-500 mb-6">
              Enter keywords to search through thousands of legal cases from Indian courts.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['section 377', 'dowry harassment', 'contract law', 'property dispute', 'constitutional law'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;
