import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Server,
  Clock,
  Globe,
  Shield,
  Code,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Mail,
  Phone,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react';

const APIStatus = () => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAPIStatus();
  }, []);

  const fetchAPIStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/health');

      if (!response.ok) {
        throw new Error('Failed to fetch API status');
      }

      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching API status:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ok':
      case 'connected':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading API Status</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAPIStatus}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-orange-600" />
            LEGALVAULT API Status
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive status overview of the LEGALVAULT API and system components
          </p>
        </div>

        {/* Service Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{apiData?.service}</h2>
              <p className="text-gray-600">{apiData?.description}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(apiData?.status)}`}>
              {apiData?.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{apiData?.version}</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatUptime(apiData?.uptime)}</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{apiData?.environment}</div>
              <div className="text-sm text-gray-600">Environment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatTimestamp(apiData?.timestamp)}</div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </div>
     {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Node Version</div>
              <div className="font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                {apiData?.system?.nodeVersion}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Platform</div>
              <div className="font-medium">{apiData?.system?.platform}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Architecture</div>
              <div className="font-medium">{apiData?.system?.architecture}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Load Average</div>
              <div className="font-medium">{apiData?.system?.loadAverage}</div>
            </div>
          </div>

          <div className="mt-6">
            <h5 className="font-medium text-gray-900 mb-3">Memory Usage</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Used Memory</div>
                <div className="font-medium text-blue-600">{apiData?.system?.memory?.used}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Memory</div>
                <div className="font-medium text-green-600">{apiData?.system?.memory?.total}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Free Memory</div>
                <div className="font-medium">{apiData?.system?.memory?.free}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Site Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Site Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{apiData?.siteInfo?.name}</h4>
              <p className="text-gray-600 mb-3">{apiData?.siteInfo?.tagline}</p>
              <p className="text-sm text-gray-500">{apiData?.siteInfo?.description}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Target Audience</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {apiData?.siteInfo?.targetAudience?.map((audience, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {audience}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h5 className="font-medium text-gray-900 mb-3">Key Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {apiData?.siteInfo?.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${getStatusColor(apiData?.database?.status)}`}>
              <div className="font-medium">Status</div>
              <div className="text-lg font-semibold">{apiData?.database?.status}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Database Type</div>
              <div className="font-medium">{apiData?.database?.name}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Connection State</div>
              <div className="font-medium">{apiData?.database?.readyState}</div>
            </div>
          </div>
        </div>

       

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            API Documentation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Base Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Base URL:</strong> {apiData?.apiDocumentation?.baseUrl}</div>
                <div><strong>Version:</strong> {apiData?.apiDocumentation?.version}</div>
                <div><strong>Content Type:</strong> {apiData?.apiDocumentation?.contentType}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quick Links</h4>
              <div className="space-y-2">
                {apiData?.links && Object.entries(apiData.links).map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Available Endpoints</h4>
            <div className="space-y-4">
              {apiData?.apiDocumentation?.endpoints && Object.entries(apiData.apiDocumentation.endpoints).map(([category, data]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2 capitalize">{category} Endpoints</h5>
                  <div className="text-sm text-gray-600 mb-2">Base Route: {data.baseRoute}</div>
                  <div className="text-sm text-gray-600 mb-3">{data.description}</div>

                  <div className="space-y-2">
                    {data.endpoints?.map((endpoint, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <div className="text-sm text-gray-600">{endpoint.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Data */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Data Available
          </h3>
          <p className="text-gray-600 mb-4">{apiData?.apiDocumentation?.legalData?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiData?.apiDocumentation?.legalData?.availableActs?.map((act, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{act.act}</h4>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Year: {act.year}</div>
                  <div>Sections: {act.sections}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Rate Limiting
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Method:</strong> {apiData?.apiDocumentation?.security?.authentication}</div>
                <div><strong>Token Expiration:</strong> {apiData?.apiDocumentation?.security?.tokenExpiration}</div>
                <div><strong>Password Encryption:</strong> {apiData?.apiDocumentation?.security?.passwordEncryption}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rate Limits</h4>
              <div className="space-y-2 text-sm">
                {apiData?.apiDocumentation?.rateLimits && Object.entries(apiData.apiDocumentation.rateLimits).map(([key, value]) => (
                  <div key={key}><strong className="capitalize">{key}:</strong> {value}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Codes */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Codes Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiData?.apiDocumentation?.errorCodes && Object.entries(apiData.apiDocumentation.errorCodes).map(([code, description]) => (
              <div key={code} className="flex gap-3 p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                  {code}
                </span>
                <span className="text-sm text-gray-700">{description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {apiData?.contact && Object.entries(apiData.contact).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 capitalize">{key}</div>
                <div className="font-medium flex items-center gap-2">
                  {key.includes('email') ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIStatus;