import React from 'react';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users, 
  Globe, 
  Settings, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  UserCheck,
  Server,
  Key,
  Activity
} from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const sections = [
    {
      id: "introduction",
      title: "Introduction and Scope",
      icon: Eye,
      content: [
        "This Privacy Policy describes how LEGALVAULT ('the Service') collects, uses, stores, and protects personal information in compliance with the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000.",
        "The Service is operated by the Government of India, Ministry of Law & Justice, for the exclusive purpose of digital evidence management in law enforcement and judicial proceedings.",
        "This policy applies to all users of LEGALVAULT, including law enforcement officers, judicial personnel, forensic experts, legal counsel, and administrative staff.",
        "We are committed to protecting the privacy rights of all individuals while fulfilling our statutory obligations for law enforcement and national security."
      ]
    },
    {
      id: "data-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal Identification Information: Name, government employee ID, designation, department, contact details, and biometric data for authentication purposes.",
        "Professional Credentials: License numbers, bar council registration, court ID numbers, forensic certifications, and employment verification documents.",
        "Authentication Data: Login credentials, digital certificates, multi-factor authentication tokens, and security questions.",
        "Activity Logs: System access records, evidence handling activities, search queries, document downloads, and user interactions with the platform.",
        "Technical Information: IP addresses, device identifiers, browser information, session data, and system performance metrics.",
        "Evidence-Related Data: Case information, evidence metadata, chain of custody records, and associated personal data within digital evidence files."
      ]
    },
    {
      id: "collection-methods",
      title: "How We Collect Information",
      icon: Activity,
      content: [
        "Direct Collection: Information provided during account registration, KYC verification, profile updates, and system interactions.",
        "Automatic Collection: System logs, access records, security monitoring, and performance analytics collected automatically during Service use.",
        "Third-Party Sources: Verification data from government databases, professional licensing bodies, and authorized background check agencies.",
        "Evidence Processing: Personal data extracted from digital evidence during forensic analysis and case investigations.",
        "Biometric Collection: Fingerprints, facial recognition data, and other biometric identifiers for secure authentication and non-repudiation."
      ]
    },
    {
      id: "data-usage",
      title: "How We Use Your Information",
      icon: Settings,
      content: [
        "Authentication and Authorization: Verifying user identity, managing access controls, and ensuring only authorized personnel can access sensitive evidence.",
        "Evidence Management: Maintaining chain of custody records, tracking evidence handling, and ensuring forensic integrity of digital materials.",
        "Legal Proceedings: Supporting court proceedings, providing audit trails, and maintaining records for judicial review and appeals.",
        "Security Monitoring: Detecting unauthorized access, preventing data breaches, and maintaining system security through continuous monitoring.",
        "Compliance and Audit: Meeting legal requirements, supporting internal audits, and providing records to oversight bodies and regulatory authorities.",
        "System Improvement: Analyzing usage patterns to enhance system performance, user experience, and security measures."
      ]
    },
    {
      id: "legal-basis",
      title: "Legal Basis for Processing",
      icon: FileText,
      content: [
        "Statutory Authority: Processing under the Information Technology Act, 2000, Criminal Procedure Code, 1973, and Indian Evidence Act, 1872.",
        "Law Enforcement Functions: Data processing necessary for prevention, investigation, and prosecution of criminal offenses under Indian law.",
        "Judicial Proceedings: Supporting court proceedings, maintaining evidence integrity, and ensuring fair administration of justice.",
        "National Security: Protecting national security interests and supporting counter-terrorism and intelligence operations as authorized by law.",
        "Consent: Where applicable, processing based on explicit consent from data subjects for specific purposes beyond legal obligations.",
        "Vital Interests: Processing necessary to protect life, safety, or other vital interests of individuals or the public."
      ]
    },
    {
      id: "data-sharing",
      title: "Information Sharing and Disclosure",
      icon: Users,
      content: [
        "Authorized Personnel: Sharing with law enforcement officers, judges, prosecutors, defense counsel, and forensic experts as required for case proceedings.",
        "Government Agencies: Disclosure to other government departments, agencies, and authorities as mandated by law or court orders.",
        "International Cooperation: Sharing with foreign law enforcement agencies under mutual legal assistance treaties (MLATs) and bilateral agreements.",
        "Court Orders: Disclosure pursuant to court orders, subpoenas, warrants, and other legal processes issued by competent authorities.",
        "Third-Party Service Providers: Limited sharing with government-approved vendors for system maintenance, security services, and technical support under strict confidentiality agreements.",
        "Emergency Situations: Disclosure to prevent imminent harm to public safety, national security, or individual welfare as permitted by law."
      ]
    },
    {
      id: "data-security",
      title: "Data Security and Protection Measures",
      icon: Lock,
      content: [
        "Encryption: All data encrypted using AES-256 encryption for data at rest and TLS 1.3 for data in transit, with regular key rotation protocols.",
        "Blockchain Technology: Evidence integrity protected through immutable blockchain records ensuring tamper-proof storage and verification.",
        "Access Controls: Multi-factor authentication, role-based access controls, and principle of least privilege ensuring appropriate access levels.",
        "Network Security: Firewalls, intrusion detection systems, VPNs, and network segmentation protecting against unauthorized access and cyber threats.",
        "Physical Security: Data centers secured with biometric access, 24/7 monitoring, environmental controls, and disaster-resistant infrastructure.",
        "Regular Audits: Continuous security monitoring, penetration testing, vulnerability assessments, and compliance audits by independent security firms."
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention and Disposal",
      icon: Clock,
      content: [
        "Evidence Data: Retained for the duration required by law, typically the statute of limitations period plus additional time for appeals and post-conviction proceedings.",
        "User Activity Logs: Maintained for minimum seven years or as required by government retention policies and audit requirements.",
        "Authentication Records: Retained for the duration of employment plus five years for audit and security investigation purposes.",
        "System Logs: Technical logs retained for two years unless required for ongoing investigations or legal proceedings.",
        "Backup Data: Encrypted backups maintained according to disaster recovery requirements with secure disposal protocols.",
        "Secure Disposal: All data disposal follows government-approved methods including cryptographic erasure, physical destruction, and certified disposal processes."
      ]
    },
    {
      id: "user-rights",
      title: "Your Privacy Rights",
      icon: UserCheck,
      content: [
        "Right to Access: Request access to your personal data maintained in the system, subject to law enforcement exemptions and security clearance requirements.",
        "Right to Rectification: Request correction of inaccurate personal information through proper channels and verification procedures.",
        "Right to Explanation: Understand how your data is processed, though certain details may be restricted for security and operational reasons.",
        "Right to Complaint: File complaints with the Data Protection Officer or relevant supervisory authorities regarding privacy concerns.",
        "Limitations: Certain rights may be restricted when processing is necessary for law enforcement, national security, or judicial proceedings.",
        "Data Subject Requests: All requests must be submitted through official channels with proper identification and authorization."
      ]
    },
    {
      id: "cookies-tracking",
      title: "Cookies and Tracking Technologies",
      icon: Globe,
      content: [
        "Session Cookies: Essential cookies for user authentication, session management, and security features required for system functionality.",
        "Security Cookies: Used for fraud prevention, security monitoring, and maintaining session integrity during system use.",
        "Performance Analytics: Anonymous usage statistics to monitor system performance, identify issues, and improve user experience.",
        "No Third-Party Tracking: The system does not use third-party advertising cookies or social media tracking technologies.",
        "Cookie Management: Users can review cookie settings through their browser, though essential cookies cannot be disabled without affecting system functionality.",
        "Data Minimization: Only necessary tracking data is collected, with regular reviews to ensure minimal privacy impact."
      ]
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: Server,
      content: [
        "Data Localization: Primary data storage within India's borders in compliance with data localization requirements and national security policies.",
        "Cross-Border Sharing: Limited international transfers only for legitimate law enforcement cooperation under established treaties and agreements.",
        "Adequate Protection: Any international transfer includes appropriate safeguards to ensure equivalent data protection standards.",
        "Government Approval: All cross-border data sharing requires proper authorization from competent government authorities.",
        "Reciprocity Agreements: Data sharing limited to countries with reciprocal data protection agreements and mutual legal assistance treaties.",
        "National Security Review: All international transfers subject to national security review and approval processes."
      ]
    },
    {
      id: "children-privacy",
      title: "Children's Privacy Protection",
      icon: Shield,
      content: [
        "No Direct Collection: The system does not directly collect personal information from children under 18 years of age.",
        "Evidence Context: Children's data may be processed when contained within digital evidence, with additional safeguards and restricted access.",
        "Special Protections: Enhanced privacy protections for minors' data including limited access, secure handling, and expedited disposal procedures.",
        "Parental Rights: Parents/guardians may request information about children's data processing, subject to legal restrictions and court orders.",
        "Sensitive Handling: Special procedures for cases involving child victims or witnesses, with additional security and confidentiality measures.",
        "Legal Compliance: Full compliance with child protection laws and juvenile justice procedures."
      ]
    },
    {
      id: "changes-updates",
      title: "Policy Updates and Notifications",
      icon: CheckCircle,
      content: [
        "Regular Reviews: This policy is reviewed annually or when significant changes occur in legislation, technology, or operational procedures.",
        "User Notification: Material changes communicated through system notifications, official emails, and posting on the government portal.",
        "Version Control: All policy versions are archived and available for reference, with clear documentation of changes made.",
        "Effective Dates: Changes become effective 30 days after notification unless immediate implementation is required for security or legal reasons.",
        "Consultation Process: Major policy changes may involve consultation with user groups, privacy advocates, and legal experts.",
        "Compliance Monitoring: Regular monitoring to ensure policy implementation and compliance with updated requirements."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-800 text-white">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Shield className="w-16 h-16 text-green-200" />
              <Eye className="w-12 h-12 text-green-300" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Data Protection and Privacy Framework for LEGALVAULT Users
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-green-200">
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

      {/* Privacy Commitment */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-green-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Privacy Commitment</h3>
              <p className="text-green-700 leading-relaxed">
                LEGALVAULT is committed to protecting your privacy while fulfilling our statutory obligations for law enforcement and judicial proceedings. We implement the highest standards of data protection in compliance with Indian privacy laws and international best practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-green-600" />
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
            <h2 className="text-2xl font-bold mb-6 text-center">Privacy Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Key className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold mb-2">Data Protection Officer</h3>
                <p className="text-gray-300">dpo@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5681</p>
              </div>
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold mb-2">Privacy Complaints</h3>
                <p className="text-gray-300">privacy@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5682</p>
              </div>
              <div>
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="font-semibold mb-2">User Rights</h3>
                <p className="text-gray-300">rights@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5683</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;