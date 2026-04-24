import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Clock,
  AlertCircle,
  Upload,
  Search,
  Plus,
  Loader,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const formatTimestamp = (ts) => {
  if (!ts) return "N/A";
  const date =
    typeof ts === "number" ? new Date(ts * 1000 || ts) : new Date(ts);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const PoliceDashboard = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const { token } = useAuth();
  const navigate = useNavigate();

  const [policeStats, setPoliceStats] = useState({
    onchainCases: 0,
    onchainEvidence: 0,
    pendingReviews: 0,
    urgentCases: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [onchainCases, setOnchainCases] = useState([]);
  const [evidenceByCase, setEvidenceByCase] = useState({});
  const [recentEvidence, setRecentEvidence] = useState([]);

  useEffect(() => {
    if (!token) return;
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const casesResp = await fetch(`${API_BASE_URL}/cases/onchain`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!casesResp.ok) {
          const err = await casesResp.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load cases");
        }
        const casesData = await casesResp.json();
        const caseList = casesData.cases || [];
        const caseCount = casesData.count ?? caseList.length;

        // Fetch all evidence once and map to cases
        const evidenceResp = await fetch(`${API_BASE_URL}/evidence/onchain`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!evidenceResp.ok) {
          const err = await evidenceResp.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load evidence");
        }
        const evidenceData = await evidenceResp.json();
        const evidenceCases = evidenceData.cases || [];

        const caseLookup = caseList.reduce((acc, cur) => {
          acc[cur.caseId] = cur;
          return acc;
        }, {});

        const evidenceMap = {};
        const evidencePreview = [];
        let totalEvidence = 0;

        evidenceCases.forEach((row) => {
          const items = (row.evidence || []).map((ev) => ({
            ...ev,
            caseId: row.caseId,
            caseNumber: caseLookup[row.caseId]?.caseNumber || row.caseId,
          }));
          evidenceMap[row.caseId] = items.length;
          totalEvidence += items.length;
          evidencePreview.push(...items.slice(0, 2));
        });

        setPoliceStats((prev) => ({
          ...prev,
          onchainCases: caseCount,
          onchainEvidence: totalEvidence,
        }));
        setOnchainCases(caseList);
        setEvidenceByCase(evidenceMap);
        setRecentEvidence(evidencePreview.slice(0, 6));
      } catch (err) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [token]);

  const StatCard = ({ title, value, icon: Icon, color, action }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : value}
            </p>
          </div>
        </div>
        {action && (
          <button className="text-orange-600 hover:text-orange-700">
            {action}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Police Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage cases and evidence collection
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Police Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="On-Chain Cases"
            value={policeStats.onchainCases}
            icon={Briefcase}
            color="bg-blue-500"
            action="View All"
          />
          <StatCard
            title="On-Chain Evidence"
            value={policeStats.onchainEvidence}
            icon={FileText}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Reviews"
            value={policeStats.pendingReviews}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Urgent Cases"
            value={policeStats.urgentCases}
            icon={AlertCircle}
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Upload Evidence",
                  description:
                    "Upload digital evidence (photos, videos, documents, audio, FIRs, charge sheets) to IPFS",
                  icon: Upload,
                  href: "/police/upload-evidence-ipfs",
                  color: "bg-orange-600",
                },
                // {
                //   title: "Upload Evidence",
                //   description: "Add new evidence to a case",
                //   icon: Upload,
                //   href: "/evidence/upload",
                //   color: "bg-blue-500",
                // },
                {
                  title: "Create New Case",
                  description: "Prepare and sign on-chain case creation",
                  icon: Plus,
                  href: "/police/create-case",
                  color: "bg-green-500",
                },
                {
                  title: "View Cases",
                  description: "Browse cases and their evidence",
                  icon: Search,
                  href: "/police/cases-onchain",
                  color: "bg-purple-500",
                },
                // {
                //   title: "Search Evidence",
                //   description: "Find existing evidence",
                //   icon: Search,
                //   href: "/evidence/search",
                //   color: "bg-purple-500",
                // },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.href)}
                  className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Active Cases
              </h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading cases…</p>
              ) : onchainCases.length === 0 ? (
                <p className="text-sm text-gray-500">No cases available.</p>
              ) : (
                <div className="space-y-4">
                  {onchainCases.slice(0, 6).map((c) => (
                    <div
                      key={c.caseId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {c.caseNumber || c.caseId}
                        </h4>
                        {/* <p className="text-xs text-gray-500 break-all">
                          {c.caseId}
                        </p> */}
                        <p className="text-xs text-gray-500">
                          Status: {c.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Evidence: {evidenceByCase[c.caseId] || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Evidence
              </h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading evidence…</p>
              ) : recentEvidence.length === 0 ? (
                <p className="text-sm text-gray-500">No evidence available.</p>
              ) : (
                <div className="space-y-4">
                  {recentEvidence.map((ev, idx) => (
                    <div
                      key={`${ev.caseId}-${idx}`}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ev.evidenceType}
                        </p>
                        <p className="text-xs text-gray-500 break-all">
                          Case: {ev.caseNumber} ({ev.caseId})
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded by {ev.uploader}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(ev.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
