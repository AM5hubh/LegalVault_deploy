import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  FileText,
  Gavel,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  BookOpen,
  Download,
  Loader,
  ArrowLeft,
  Star,
  Clock,
  Building2,
} from 'lucide-react';

const CaseReport = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCaseData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/cases/${caseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCaseData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching case:', err);
      setError('Failed to load case details');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[severity] || colors.medium;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading case analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Case</h2>
          <p className="text-gray-600 mb-6">{error || 'Case not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { analysis, costEstimation, lawyerRecommendations } = caseData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center">
                    <Scale className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{caseData.caseTitle}</h1>
                    <p className="text-gray-600 mt-1">
                      Case ID: {caseData._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {caseData.incidentCategory.charAt(0).toUpperCase() + caseData.incidentCategory.slice(1)}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getSeverityColor(analysis?.classification?.severityLevel || 'medium')}`}>
                    {analysis?.classification?.severityLevel?.toUpperCase() || 'MEDIUM'} SEVERITY
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {analysis?.classification?.type?.toUpperCase() || 'CASE'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Filed on</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(caseData.createdAt).toLocaleDateString('en-IN')}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-end space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Confidence: {analysis?.confidenceScore || 75}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-orange-600" />
            Case Description
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {caseData.caseDescription}
          </p>
          {caseData.incidentDate && (
            <div className="mt-4 flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Incident Date: {new Date(caseData.incidentDate).toLocaleDateString('en-IN')}</span>
            </div>
          )}
          {caseData.incidentLocation?.city && (
            <div className="mt-2 flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>
                {[caseData.incidentLocation.city, caseData.incidentLocation.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Applicable Laws */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-orange-600" />
            Applicable Laws & Sections
          </h2>
          {analysis?.applicableSections && analysis.applicableSections.length > 0 ? (
            <div className="space-y-4">
              {analysis.applicableSections.map((section, index) => (
                <div
                  key={index}
                  className="border-l-4 border-orange-500 bg-orange-50 p-5 rounded-r-xl hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-semibold">
                          {section.act}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          Section {section.sectionNumber}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {section.sectionTitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {section.sectionDescription}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">Relevance</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {section.relevanceScore}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No applicable sections found.</p>
          )}
        </div>

        {/* Punishment Details */}
        {analysis?.punishment && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Gavel className="w-6 h-6 mr-3 text-orange-600" />
              Potential Punishment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="text-red-600 font-semibold mb-2">Maximum Jail Term</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analysis.punishment.maxJailTerm || 'N/A'}
                </div>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="text-yellow-700 font-semibold mb-2">Minimum Jail Term</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analysis.punishment.minJailTerm || 'N/A'}
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-blue-600 font-semibold mb-2">Maximum Fine</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analysis.punishment.maxFine
                    ? formatCurrency(analysis.punishment.maxFine)
                    : 'N/A'}
                </div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="text-green-600 font-semibold mb-2">Minimum Fine</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analysis.punishment.minFine
                    ? formatCurrency(analysis.punishment.minFine)
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4">
                <CheckCircle
                  className={`w-6 h-6 mr-2 ${analysis.classification?.bailable ? 'text-green-600' : 'text-red-600'}`}
                />
                <span className="font-medium">
                  {analysis.classification?.bailable ? 'Bailable' : 'Non-Bailable'}
                </span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4">
                <Shield
                  className={`w-6 h-6 mr-2 ${analysis.classification?.cognizable ? 'text-red-600' : 'text-green-600'}`}
                />
                <span className="font-medium">
                  {analysis.classification?.cognizable ? 'Cognizable' : 'Non-Cognizable'}
                </span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4">
                <FileText
                  className={`w-6 h-6 mr-2 ${analysis.classification?.compoundable ? 'text-green-600' : 'text-red-600'}`}
                />
                <span className="font-medium">
                  {analysis.classification?.compoundable ? 'Compoundable' : 'Non-Compoundable'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Legal Procedures */}
        {analysis?.procedures && analysis.procedures.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-orange-600" />
              Legal Procedure Roadmap
            </h2>
            <div className="space-y-4">
              {analysis.procedures.map((procedure, index) => (
                <div key={index} className="relative pl-8 pb-8 border-l-2 border-orange-300 last:border-l-0 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 bg-orange-600 rounded-full"></div>
                  <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Step {procedure.step}: {procedure.title}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                        {procedure.estimatedDuration}
                      </span>
                    </div>
                    <p className="text-gray-700">{procedure.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {analysis?.requiredDocuments && analysis.requiredDocuments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-orange-600" />
              Required Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border-2 ${doc.mandatory ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start">
                    <Download className={`w-5 h-5 mt-1 mr-3 ${doc.mandatory ? 'text-red-600' : 'text-gray-600'}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {doc.documentName}
                        {doc.mandatory && (
                          <span className="ml-2 text-xs text-red-600 font-bold">*REQUIRED</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lawyer Recommendations */}
        {lawyerRecommendations && lawyerRecommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-orange-600" />
              Recommended Lawyers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyerRecommendations.map((lawyer, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{lawyer.name}</h3>
                      <p className="text-sm text-gray-600">{lawyer.experience} years experience</p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-900">{lawyer.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {lawyer.specialization.map((spec, idx) => (
                      <span key={idx} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {lawyer.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {lawyer.availability.replace('_', ' ').charAt(0).toUpperCase() + lawyer.availability.slice(1).replace('_', ' ')}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Consultation Fee:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(lawyer.consultationFee)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Case Fee Range:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(lawyer.caseFee.min)} - {formatCurrency(lawyer.caseFee.max)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {lawyer.contactInfo.phone && (
                        <a href={`tel:${lawyer.contactInfo.phone}`} className="flex items-center text-orange-600 hover:text-orange-700">
                          <Phone className="w-4 h-4 mr-2" />
                          {lawyer.contactInfo.phone}
                        </a>
                      )}
                      {lawyer.contactInfo.email && (
                        <a href={`mailto:${lawyer.contactInfo.email}`} className="flex items-center text-orange-600 hover:text-orange-700">
                          <Mail className="w-4 h-4 mr-2" />
                          {lawyer.contactInfo.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Estimation */}
        {costEstimation && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-orange-600" />
              Estimated Legal Costs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation:</span>
                    <span className="font-semibold">
                      {formatCurrency(costEstimation.consultationCost.min)} - {formatCurrency(costEstimation.consultationCost.max)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Case Filing:</span>
                    <span className="font-semibold">
                      {formatCurrency(costEstimation.caseFilingCost.min)} - {formatCurrency(costEstimation.caseFilingCost.max)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Representation:</span>
                    <span className="font-semibold">
                      {formatCurrency(costEstimation.representationCost.min)} - {formatCurrency(costEstimation.representationCost.max)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documentation:</span>
                    <span className="font-semibold">
                      {formatCurrency(costEstimation.documentationCost.min)} - {formatCurrency(costEstimation.documentationCost.max)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-8 text-white">
                <h3 className="text-xl font-semibold mb-2">Total Estimated Cost</h3>
                <div className="text-5xl font-bold mb-2">
                  {formatCurrency(costEstimation.totalEstimatedCost.min)}
                </div>
                <div className="text-3xl font-semibold opacity-90">
                  to {formatCurrency(costEstimation.totalEstimatedCost.max)}
                </div>
                <p className="mt-6 text-orange-100 text-sm">
                  * Actual costs may vary based on case complexity and lawyer fees
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Court Jurisdiction */}
        {analysis?.jurisdiction && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-6 h-6 mr-3 text-orange-600" />
              Court Jurisdiction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-blue-600 font-semibold mb-2">Court Level</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {analysis.jurisdiction.courtLevel.replace('_', ' ')} 
                </div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="text-green-600 font-semibold mb-2">Police Station</div>
                <div className="text-lg font-semibold text-gray-900">
                  {analysis.jurisdiction.policeStation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseReport;
