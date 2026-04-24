import React, { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader, Search, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PoliceCasesOnchain = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const IPFS_GATEWAY =
    import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs";

  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [filteredEvidence, setFilteredEvidence] = useState([]);
  const [evidenceSearch, setEvidenceSearch] = useState("");
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

  const formatTimestamp = (value) => {
    if (value === undefined || value === null) return "";
    const num = Number(value);
    if (Number.isNaN(num) || num <= 0) return String(value);
    const date = new Date(num * 1000);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  };

  const fetchCases = async () => {
    try {
      setIsLoadingCases(true);
      setError("");
      const resp = await fetch(`${API_BASE_URL}/cases/onchain`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load cases");
      }
      const data = await resp.json();
      const items = data.cases || [];
      setCases(items);
      setFilteredCases(applyFilter(items, search));
    } catch (err) {
      setError(err.message || "Failed to load cases");
    } finally {
      setIsLoadingCases(false);
    }
  };

  const applyFilter = (list, term) => {
    const t = term.trim().toLowerCase();
    if (!t) return list;
    return list.filter((c) => {
      const number = c.caseNumber || "";
      const id = c.caseId || "";
      const registrar = c.createdBy || "";
      return (
        number.toLowerCase().includes(t) ||
        id.toLowerCase().includes(t) ||
        registrar.toLowerCase().includes(t)
      );
    });
  };

  const applyEvidenceFilter = (list, term) => {
    const t = term.trim().toLowerCase();
    if (!t) return list;
    return list.filter((ev) => {
      const cid = ev.ipfsCID || "";
      const type = ev.evidenceType || "";
      const uploader = ev.uploader || "";
      return (
        cid.toLowerCase().includes(t) ||
        type.toLowerCase().includes(t) ||
        uploader.toLowerCase().includes(t)
      );
    });
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearch(term);
    setFilteredCases(applyFilter(cases, term));
  };

  const fetchEvidence = async (caseIdHex) => {
    try {
      setIsLoadingEvidence(true);
      setError("");
      const resp = await fetch(`${API_BASE_URL}/evidence/onchain`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load evidence");
      }
      const data = await resp.json();
      const all = data.cases || [];
      const found = all.find((c) => c.caseId === caseIdHex);
      const list = found?.evidence || [];
      setEvidence(list);
      setFilteredEvidence(applyEvidenceFilter(list, evidenceSearch));
    } catch (err) {
      setError(err.message || "Failed to load evidence");
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCases();
  }, [token]);

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setEvidence([]);
    setFilteredEvidence([]);
    fetchEvidence(c.caseId);
  };

  const handleEvidenceSearchChange = (e) => {
    const term = e.target.value;
    setEvidenceSearch(term);
    setFilteredEvidence(applyEvidenceFilter(evidence, term));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">On-Chain Cases</h1>
          <p className="text-sm text-gray-600 mt-1">
            View CaseRegistry cases and their EvidenceRegistry entries (wallet
            not required for read-only).
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={fetchCases}
          disabled={isLoadingCases}
        >
          {isLoadingCases ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshIcon />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <Shield className="w-4 h-4" /> Cases
            </div>
          </div>
          <div className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by number, caseId, registrar"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
          {isLoadingCases ? (
            <div className="flex justify-center py-8 text-gray-500">
              <Loader className="w-5 h-5 animate-spin" />
            </div>
          ) : filteredCases.length === 0 ? (
            <p className="text-sm text-gray-500">No cases found.</p>
          ) : (
            <div className="space-y-2 max-h-130 overflow-y-auto pr-1">
              {filteredCases.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCase(c)}
                  className={`w-full text-left border rounded-lg px-3 py-3 hover:border-orange-500 transition ${
                    selectedCase?.caseId === c.caseId
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">
                      {c.caseNumber || "(no number)"}
                    </div>
                    <span className="text-xs text-gray-500">{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 break-all mt-1">
                    {c.caseId}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created by: {c.createdBy}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <FileText className="w-4 h-4" /> Case Details
            </div>
          </div>

          {!selectedCase ? (
            <div className="text-sm text-gray-500">
              Select a case to view details and evidence.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Case Number:</span>{" "}
                  {selectedCase.caseNumber}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Case ID:</span>{" "}
                  <span className="break-all">{selectedCase.caseId}</span>
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Status:</span>{" "}
                  {selectedCase.status}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Registrar:</span>{" "}
                  {selectedCase.createdBy}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Created:</span>{" "}
                  {selectedCase.timestampCreated?.toString?.() ||
                    selectedCase.timestampCreated}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">Evidence</div>
                </div>
                <div className="mb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={evidenceSearch}
                      onChange={handleEvidenceSearchChange}
                      placeholder="Search evidence by CID, type, uploader"
                      className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                {isLoadingEvidence ? (
                  <div className="flex justify-center py-6 text-gray-500">
                    <Loader className="w-5 h-5 animate-spin" />
                  </div>
                ) : filteredEvidence.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No evidence found for this case.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredEvidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <a
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1 text-sm font-semibold text-white hover:bg-orange-600"
                            href={`${IPFS_GATEWAY}/${ev.ipfsCID}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View evidence
                          </a>
                          {/* <span className="text-xs text-gray-500 break-all">
                            CID: {ev.ipfsCID}
                          </span> */}
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Type:</span>{" "}
                          {ev.evidenceType}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploader: {ev.uploader}
                        </p>
                        <p className="text-xs text-gray-500">
                          {/* Timestamp:{" "} */}
                          Timestamp: {formatTimestamp(ev.timestamp)}
                          {/* {ev.timestamp?.toString?.() || ev.timestamp} */}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M20 20v-5h-.581m-15.357-2a8.003 8.003 0 0015.357 2"
    />
  </svg>
);

export default PoliceCasesOnchain;
