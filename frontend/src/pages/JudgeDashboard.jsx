import React, { useState, useEffect } from 'react'
import { Gavel, FileText, Clock, CheckCircle, Eye, Calendar } from 'lucide-react'

const JudgeDashboard = () => {
  const [user, setUser] = useState(null)
  const [judgeStats, setJudgeStats] = useState({
    activeCases: 0,
    pendingDecisions: 0,
    evidenceReviewed: 0,
    completedCases: 0,
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    setJudgeStats({
      activeCases: 8,
      pendingDecisions: 5,
      evidenceReviewed: 24,
      completedCases: 12,
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Judicial Dashboard</h1>
          <p className="text-gray-600 mt-2">Case management and judicial review</p>
        </div>

        {/* Judge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {judgeStats.activeCases}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Decisions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {judgeStats.pendingDecisions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evidence Reviewed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {judgeStats.evidenceReviewed}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {judgeStats.completedCases}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cases and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Cases Awaiting Decision
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    id: '2024-001',
                    title: 'Theft Case - Final Judgment',
                    hearing: 'Tomorrow',
                    priority: 'High',
                  },
                  {
                    id: '2024-002',
                    title: 'Fraud Investigation',
                    hearing: 'Next Week',
                    priority: 'Medium',
                  },
                  {
                    id: '2024-003',
                    title: 'Assault Case Review',
                    hearing: 'In 3 days',
                    priority: 'High',
                  },
                ].map((case_item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">Case #{case_item.id}</h4>
                      <p className="text-sm text-gray-600">{case_item.title}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {case_item.hearing}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          case_item.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {case_item.priority}
                      </span>
                      <button className="p-1 text-orange-600 hover:text-orange-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Court Schedule</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    time: '09:00 AM',
                    case: 'Case #2024-001',
                    type: 'Final Hearing',
                  },
                  {
                    time: '11:30 AM',
                    case: 'Case #2024-005',
                    type: 'Evidence Review',
                  },
                  {
                    time: '02:00 PM',
                    case: 'Case #2024-003',
                    type: 'Witness Testimony',
                  },
                ].map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-500">
                      {schedule.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{schedule.case}</p>
                      <p className="text-sm text-gray-500">{schedule.type}</p>
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

export default JudgeDashboard
