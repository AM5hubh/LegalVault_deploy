import React from 'react';
import { 
  Shield, 
  FileText, 
  Scale, 
  Lock, 
  CheckCircle, 
  ExternalLink,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t-4 border-orange-500">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">LEGALVAULT</h3>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Secure Blockchain-Based Digital Evidence Management System for Law Enforcement and Judicial Authorities
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4 text-orange-600" />
                <span>Blockchain Security</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>Chain of Custody</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Scale className="w-4 h-4 text-orange-600" />
                <span>Legal Compliance</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="/evidence" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Evidence Management</span>
                </a>
              </li>
              <li>
                <a href="/cases" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Case Management</span>
                </a>
              </li>
              <li>
                <a href="/audit-trail" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Audit Trail</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Support & Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="/help" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="/documentation" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a href="/training" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Training Materials</span>
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                  <span>Contact Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Blockchain Network</span>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Evidence Storage</span>
                <span className="text-xs text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="text-xs text-green-600 font-medium">Secure</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-orange-600" />
                <span>1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-orange-600" />
                <span>support@legalvault.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Government Links Section */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Ministry Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://lawmin.gov.in/" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                    <span>Ministry of Law & Justice</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://xn--i1b5bzbybhfo5c8b4bxh.xn--11b7cb3a6a.xn--h2brj9c/en#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                    <span>Ministry of Home Affairs</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://www.digitalindia.gov.in/" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center">
                    <span>Digital India</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Legal Resources</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/security" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                    Security Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Compliance</h5>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
                  ISO 27001
                </span>
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
                  IT Act 2000
                </span>
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
                  Evidence Act 1872
                </span>
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
                  CrPC 1973
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm">
              <span>&copy; {currentYear} LEGALVAULT - Government of India. All rights reserved.</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Version 2.1.0</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-300">Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Verified Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;