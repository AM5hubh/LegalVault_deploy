import React, { useState, useEffect } from 'react'
import { Microscope, FileText, Clock, CheckCircle, Upload, Download } from 'lucide-react'

const ForensicDashboard = () => {
  const [user, setUser] = useState(null)
  const [forensicStats, setForensicStats] = useState({
    analysisRequests: 0,
    completedAnalysis: 0,
    pendingReports: 0,
    labTests: 0,
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    setForensicStats({
      analysisRequests: 15,
      completedAnalysis: 32,
      pendingReports: 6,
      labTests: 8,
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forensic Expert Dashboard</h1>
          <p className="text-gray-600 mt-2">Evidence analysis and forensic reporting</p>
        </div>

        {/* Forensic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-500">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analysis Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{forensicStats.analysisRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Analysis</p>
                <p className="text-2xl font-semibold text-gray-900">{forensicStats.completedAnalysis}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{forensicStats.pendingReports}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{forensicStats.labTests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Queue and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Analysis Queue</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: 'EV-001', type: 'DNA Analysis', case: '2024-001', priority: 'High', deadline: '2 days' },
                  { id: 'EV-002', type: 'Fingerprint Analysis', case: '2024-002', priority: 'Medium', deadline: '5 days' },
                  { id: 'EV-003', type: 'Digital Forensics', case: '2024-003', priority: 'High', deadline: '3 days' },
                ].map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{analysis.id}</h4>
                      <p className="text-sm text-gray-600">{analysis.type}</p>
                      <p className="text-xs text-gray-500">Case #{analysis.case} • Due in {analysis.deadline}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        analysis.priority === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {analysis.priority}
                      </span>
                      <button className="p-1 text-orange-600 hover:text-orange-700">
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: 'RPT-001', type: 'DNA Match Report', case: '2024-001', status: 'Completed', date: '2 hours ago' },
                  { id: 'RPT-002', type: 'Ballistics Report', case: '2024-002', status: 'In Review', date: '1 day ago' },
                  { id: 'RPT-003', type: 'Digital Evidence Report', case: '2024-003', status: 'Completed', date: '3 days ago' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.type}</p>
                        <p className="text-sm text-gray-500">Case #{report.case} • {report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                      <button className="p-1 text-orange-600 hover:text-orange-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForensicDashboard
