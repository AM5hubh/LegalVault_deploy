import React from 'react';
import { 
  Scale, 
  Shield, 
  FileText, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Lock,
  BookOpen,
  Gavel,
  UserCheck,
  Database,
  Settings
} from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        "By accessing and using LEGALVAULT (the 'Service'), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ('Terms') and all applicable laws and regulations.",
        "These Terms constitute a legally binding agreement between you and the Government of India, Ministry of Law & Justice, regarding your use of the LEGALVAULT digital evidence management system.",
        "If you do not agree to these Terms, you must not access or use the Service. Your continued use of the Service constitutes acceptance of any modifications to these Terms."
      ]
    },
    {
      id: "definitions",
      title: "Definitions and Interpretation",
      icon: BookOpen,
      content: [
        "'Service' refers to the LEGALVAULT blockchain-based digital evidence management system operated by the Government of India.",
        "'User' means any individual authorized to access the Service, including but not limited to law enforcement officers, judicial personnel, forensic experts, and legal counsel.",
        "'Digital Evidence' refers to any information or data stored, transmitted, or maintained in digital format within the Service.",
        "'Chain of Custody' means the chronological documentation showing the seizure, custody, control, transfer, analysis, and disposition of digital evidence.",
        "'Authorized Personnel' includes police officers, judges, lawyers, forensic experts, and other individuals granted access by competent authorities."
      ]
    },
    {
      id: "eligibility",
      title: "User Eligibility and Registration",
      icon: UserCheck,
      content: [
        "The Service is exclusively available to authorized government personnel, law enforcement agencies, judicial authorities, and licensed legal practitioners within the Republic of India.",
        "Users must be at least 18 years of age and possess valid government-issued identification and professional credentials.",
        "Registration requires completion of KYC (Know Your Customer) verification process, including submission of official documentation and background verification.",
        "Each user account is personal and non-transferable. Sharing of login credentials is strictly prohibited and may result in immediate termination of access.",
        "Users must maintain accurate and current registration information and promptly notify administrators of any changes."
      ]
    },
    {
      id: "authorized-use",
      title: "Authorized Use and Responsibilities",
      icon: Shield,
      content: [
        "The Service shall be used exclusively for legitimate law enforcement, judicial, and legal purposes in accordance with Indian law.",
        "Users are responsible for maintaining the confidentiality and integrity of all digital evidence within their custody.",
        "All actions performed within the Service are logged and subject to audit. Users acknowledge that their activities may be monitored and recorded.",
        "Users must comply with all applicable laws, regulations, and departmental policies when using the Service.",
        "Evidence tampering, unauthorized access attempts, or any form of system manipulation is strictly prohibited and subject to criminal prosecution."
      ]
    },
    {
      id: "data-security",
      title: "Data Security and Blockchain Integrity",
      icon: Lock,
      content: [
        "All digital evidence is secured using advanced blockchain technology ensuring immutable records and tamper-proof storage.",
        "The Service employs military-grade encryption (AES-256) for data in transit and at rest.",
        "Blockchain entries create an unalterable chain of custody, providing cryptographic proof of evidence integrity.",
        "Users acknowledge that any attempt to circumvent security measures or compromise system integrity constitutes a serious criminal offense.",
        "Regular security audits and penetration testing ensure the highest standards of data protection."
      ]
    },
    {
      id: "evidence-handling",
      title: "Digital Evidence Handling Protocols",
      icon: Database,
      content: [
        "All digital evidence must be uploaded following established forensic procedures and chain of custody requirements.",
        "Evidence metadata, including timestamps, hash values, and custody information, is automatically recorded and cannot be modified.",
        "Users must provide accurate descriptions and classifications for all uploaded evidence.",
        "Evidence sharing between authorized parties is logged and requires proper authorization protocols.",
        "Deletion or modification of evidence records requires supervisory approval and is subject to audit trail requirements."
      ]
    },
    {
      id: "privacy-rights",
      title: "Privacy Rights and Data Protection",
      icon: Users,
      content: [
        "The Service complies with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023.",
        "Personal data is processed only for legitimate law enforcement and judicial purposes.",
        "Data subjects' rights are protected in accordance with applicable privacy laws and constitutional provisions.",
        "Cross-border data transfers, if any, comply with international treaties and bilateral agreements.",
        "Regular privacy impact assessments ensure compliance with evolving data protection requirements."
      ]
    },
    {
      id: "prohibited-activities",
      title: "Prohibited Activities",
      icon: AlertTriangle,
      content: [
        "Uploading false, misleading, or fabricated evidence is strictly prohibited and constitutes perjury under Indian law.",
        "Unauthorized access, hacking attempts, or any form of cyber attack against the Service is a criminal offense.",
        "Sharing login credentials, creating unauthorized accounts, or allowing unauthorized access is prohibited.",
        "Using the Service for personal gain, political purposes, or any non-official activities is strictly forbidden.",
        "Attempting to reverse engineer, decompile, or extract source code from the Service is prohibited.",
        "Creating, distributing, or using malicious software that could compromise system integrity is a serious offense."
      ]
    },
    {
      id: "compliance",
      title: "Legal Compliance and Regulatory Framework",
      icon: Gavel,
      content: [
        "The Service operates under the jurisdiction of Indian courts and is subject to Indian law.",
        "Evidence handling complies with the Indian Evidence Act, 1872, and the Code of Criminal Procedure, 1973.",
        "Digital signatures and electronic records are valid under the Information Technology Act, 2000.",
        "International cooperation follows established mutual legal assistance treaties (MLATs) and bilateral agreements.",
        "Regular compliance audits ensure adherence to national and international legal standards."
      ]
    },
    {
      id: "system-availability",
      title: "System Availability and Maintenance",
      icon: Settings,
      content: [
        "The Service is available 24/7, with scheduled maintenance windows communicated in advance.",
        "Service level agreements (SLAs) guarantee 99.9% uptime for critical law enforcement operations.",
        "Emergency maintenance may be performed without prior notice to address security vulnerabilities.",
        "Users are notified of planned maintenance through official channels at least 48 hours in advance.",
        "Backup and disaster recovery procedures ensure minimal data loss and rapid service restoration."
      ]
    },
    {
      id: "liability",
      title: "Limitation of Liability and Indemnification",
      icon: Scale,
      content: [
        "The Government of India shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Service.",
        "Users acknowledge that they use the Service at their own risk and responsibility.",
        "The Government disclaims all warranties, express or implied, regarding the Service's availability, accuracy, or fitness for a particular purpose.",
        "Users agree to indemnify and hold harmless the Government from any claims arising from their misuse of the Service.",
        "Maximum liability is limited to the extent permitted by law and government regulations."
      ]
    },
    {
      id: "termination",
      title: "Account Termination and Suspension",
      icon: AlertTriangle,
      content: [
        "User accounts may be suspended or terminated immediately for violation of these Terms or applicable laws.",
        "The Government reserves the right to terminate access without prior notice for security reasons.",
        "Upon termination, users must cease all use of the Service and return any confidential information.",
        "Evidence data remains accessible to authorized personnel even after individual account termination.",
        "Appeals for account reinstatement must be submitted through official channels with proper documentation."
      ]
    },
    {
      id: "modifications",
      title: "Modifications to Terms",
      icon: FileText,
      content: [
        "These Terms may be modified at any time to reflect legal, regulatory, or operational changes.",
        "Users will be notified of material changes through the Service and official communication channels.",
        "Continued use of the Service after modification constitutes acceptance of the revised Terms.",
        "Users who disagree with modifications must discontinue use of the Service.",
        "Historical versions of Terms are archived and available for reference purposes."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 text-white">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Scale className="w-16 h-16 text-blue-200" />
              <FileText className="w-12 h-12 text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Legal Framework for LEGALVAULT Digital Evidence Management System
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Effective Date: {effectiveDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Legal Notice</h3>
              <p className="text-amber-700 leading-relaxed">
                These Terms of Service constitute a binding legal agreement. By accessing LEGALVAULT, you agree to comply with all terms, conditions, and applicable laws. Violation of these terms may result in criminal prosecution under Indian law. This system is exclusively for authorized government and judicial personnel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">Legal Queries</h3>
                <p className="text-gray-300">legal@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5678</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Support</h3>
                <p className="text-gray-300">support@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5679</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Compliance Officer</h3>
                <p className="text-gray-300">compliance@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5680</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;