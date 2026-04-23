import React from 'react';
import { 
  Lock, 
  Shield, 
  Key, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Database, 
  Network, 
  Settings,
  Clock,
  Globe,
  Activity,
  FileText,
  Users,
  Zap
} from 'lucide-react';

const SecurityPolicy = () => {
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const sections = [
    {
      id: "overview",
      title: "Security Framework Overview",
      icon: Shield,
      content: [
        "LEGALVAULT employs a comprehensive, multi-layered security architecture designed to protect critical digital evidence and sensitive law enforcement data from unauthorized access, modification, or destruction.",
        "Our security framework is built on internationally recognized standards including ISO 27001, NIST Cybersecurity Framework, and Indian government security guidelines for critical information infrastructure.",
        "The system implements defense-in-depth principles with multiple security controls at every layer, ensuring robust protection against both external threats and insider risks.",
        "Continuous security monitoring, threat intelligence, and incident response capabilities provide proactive protection and rapid response to emerging security challenges."
      ]
    },
    {
      id: "blockchain-security",
      title: "Blockchain Technology and Cryptographic Protection",
      icon: Key,
      content: [
        "Immutable Evidence Storage: All digital evidence is secured using blockchain technology, creating tamper-proof records with cryptographic hashing (SHA-256) ensuring integrity verification.",
        "Smart Contracts: Automated chain of custody protocols enforced through smart contracts, eliminating human error and ensuring consistent evidence handling procedures.",
        "Distributed Consensus: Multi-node blockchain network with Byzantine Fault Tolerance (BFT) consensus mechanism providing resilience against network attacks and node failures.",
        "Cryptographic Signatures: Digital signatures using RSA-4096 and ECDSA algorithms for non-repudiation and authentication of all evidence transactions.",
        "Hash Chain Verification: Continuous integrity checking through hash chain verification, immediately detecting any unauthorized modifications or tampering attempts.",
        "Quantum-Resistant Encryption: Implementation of post-quantum cryptography algorithms to protect against future quantum computing threats."
      ]
    },
    {
      id: "access-control",
      title: "Access Control and Authentication",
      icon: Lock,
      content: [
        "Multi-Factor Authentication (MFA): Mandatory MFA for all users combining something you know (password), something you have (token/smart card), and something you are (biometrics).",
        "Role-Based Access Control (RBAC): Granular permissions based on user roles, job functions, and case assignments, implementing principle of least privilege access.",
        "Biometric Authentication: Fingerprint and facial recognition systems for high-security evidence access, integrated with national biometric databases.",
        "Smart Card Integration: PKI-based smart cards issued by government authorities for secure authentication and digital signing capabilities.",
        "Session Management: Secure session handling with automatic timeout, concurrent session limits, and activity-based session monitoring.",
        "Privileged Access Management: Special controls for administrative accounts including approval workflows, session recording, and enhanced monitoring."
      ]
    },
    {
      id: "data-encryption",
      title: "Data Encryption and Protection",
      icon: Database,
      content: [
        "End-to-End Encryption: AES-256 encryption for all data at rest, in transit, and in processing, with hardware security module (HSM) key management.",
        "Field-Level Encryption: Sensitive data fields individually encrypted with separate keys, providing granular protection even if database access is compromised.",
        "Transport Layer Security: TLS 1.3 with perfect forward secrecy for all network communications, preventing retroactive decryption of captured traffic.",
        "Database Encryption: Transparent database encryption (TDE) with encrypted backups and logs, ensuring comprehensive data protection at storage level.",
        "Key Escrow System: Secure key escrow managed by multiple custodians for evidence recovery in emergency situations or legal requirements.",
        "Encryption Key Rotation: Automatic key rotation policies with secure key lifecycle management and backward compatibility for evidence access."
      ]
    },
    {
      id: "network-security",
      title: "Network Security and Infrastructure Protection",
      icon: Network,
      content: [
        "Network Segmentation: Isolated network segments for different security zones with controlled inter-segment communication through security gateways.",
        "Firewall Protection: Next-generation firewalls (NGFW) with deep packet inspection, intrusion prevention, and application-layer filtering.",
        "Intrusion Detection and Prevention: Advanced IDS/IPS systems with AI-powered threat detection, behavioral analysis, and automated response capabilities.",
        "VPN Access: Secure VPN connections for remote access with certificate-based authentication and encrypted tunnels for field operations.",
        "DDoS Protection: Distributed denial-of-service protection with traffic analysis, rate limiting, and automatic mitigation systems.",
        "Network Monitoring: Continuous network traffic analysis with anomaly detection, threat intelligence integration, and real-time alerting."
      ]
    },
    {
      id: "physical-security",
      title: "Physical Security Measures",
      icon: Server,
      content: [
        "Secure Data Centers: Government-certified data centers with biometric access controls, 24/7 security personnel, and comprehensive surveillance systems.",
        "Environmental Controls: Climate control, fire suppression, uninterruptible power supply (UPS), and backup generators ensuring operational continuity.",
        "Equipment Security: Tamper-evident seals, secure asset tracking, and controlled disposal procedures for hardware lifecycle management.",
        "Visitor Management: Strict visitor control procedures with escort requirements, background checks, and comprehensive access logging.",
        "Facility Hardening: Physical barriers, reinforced construction, and perimeter security designed to withstand various threat scenarios.",
        "Emergency Procedures: Detailed emergency response plans for natural disasters, security incidents, and business continuity scenarios."
      ]
    },
    {
      id: "monitoring-auditing",
      title: "Security Monitoring and Audit Systems",
      icon: Eye,
      content: [
        "Security Information and Event Management (SIEM): Centralized log collection, correlation, and analysis with real-time alerting and incident response.",
        "User Activity Monitoring: Comprehensive logging of all user actions, evidence handling, and system interactions with behavioral analysis.",
        "Automated Threat Detection: Machine learning-based anomaly detection identifying suspicious patterns, unusual access, and potential insider threats.",
        "Forensic Logging: Immutable audit trails with legal-grade logging ensuring non-repudiation and supporting forensic investigations.",
        "Real-time Alerting: Immediate notification of security events with automated escalation procedures and threat response protocols.",
        "Compliance Monitoring: Continuous compliance checking against security policies, legal requirements, and operational procedures."
      ]
    },
    {
      id: "incident-response",
      title: "Incident Response and Recovery",
      icon: AlertTriangle,
      content: [
        "24/7 Security Operations Center (SOC): Round-the-clock monitoring with trained security analysts and incident response specialists.",
        "Incident Response Team: Multi-disciplinary team including security experts, legal counsel, law enforcement liaisons, and technical specialists.",
        "Response Procedures: Detailed incident response playbooks with clear escalation paths, containment procedures, and recovery strategies.",
        "Forensic Capabilities: Digital forensics tools and expertise for incident investigation, evidence preservation, and root cause analysis.",
        "Communication Protocols: Secure communication channels for incident reporting, stakeholder notification, and coordination with external agencies.",
        "Recovery and Continuity: Business continuity planning with backup systems, disaster recovery procedures, and service restoration protocols."
      ]
    },
    {
      id: "vulnerability-management",
      title: "Vulnerability Management and Testing",
      icon: Settings,
      content: [
        "Regular Vulnerability Assessments: Automated and manual vulnerability scanning with risk prioritization and remediation tracking.",
        "Penetration Testing: Annual penetration testing by certified ethical hackers simulating real-world attack scenarios.",
        "Security Code Review: Static and dynamic application security testing (SAST/DAST) integrated into development lifecycle.",
        "Patch Management: Systematic patch management with testing procedures, rollback capabilities, and emergency patching protocols.",
        "Third-Party Security Audits: Independent security assessments by government-approved auditing firms with detailed recommendations.",
        "Bug Bounty Program: Responsible disclosure program for security researchers to report vulnerabilities through official channels."
      ]
    },
    {
      id: "personnel-security",
      title: "Personnel Security and Training",
      icon: Users,
      content: [
        "Background Verification: Comprehensive background checks for all personnel with access to sensitive systems and information.",
        "Security Clearance: Government security clearance requirements for staff handling classified or sensitive evidence materials.",
        "Security Awareness Training: Mandatory security training programs covering cybersecurity, social engineering, and incident reporting.",
        "Insider Threat Program: Behavioral monitoring and reporting mechanisms to identify and mitigate insider threats and security violations.",
        "Privileged User Monitoring: Enhanced monitoring and controls for users with administrative or elevated system privileges.",
        "Separation of Duties: Critical functions divided among multiple personnel to prevent unauthorized actions and ensure accountability."
      ]
    },
    {
      id: "compliance-standards",
      title: "Compliance and Security Standards",
      icon: CheckCircle,
      content: [
        "ISO 27001 Certification: International standard for information security management systems with annual audits and continuous improvement.",
        "Government Security Standards: Compliance with Indian government security guidelines, CERT-In advisories, and national security policies.",
        "Legal Compliance: Adherence to Information Technology Act 2000, Digital Personal Data Protection Act 2023, and other applicable regulations.",
        "Industry Best Practices: Implementation of NIST, OWASP, and other internationally recognized security frameworks and standards.",
        "Regular Audits: Internal and external security audits with independent verification of controls and compliance requirements.",
        "Certification Maintenance: Continuous monitoring and improvement to maintain security certifications and accreditations."
      ]
    },
    {
      id: "data-backup-recovery",
      title: "Data Backup and Disaster Recovery",
      icon: Activity,
      content: [
        "Encrypted Backup Systems: Multiple backup copies with strong encryption stored in geographically distributed secure facilities.",
        "Recovery Time Objectives (RTO): Target recovery times of less than 4 hours for critical evidence systems and 24 hours for complete service restoration.",
        "Recovery Point Objectives (RPO): Maximum data loss limited to 15 minutes through continuous replication and point-in-time recovery capabilities.",
        "Disaster Recovery Testing: Regular disaster recovery drills and failover testing to ensure system reliability and staff preparedness.",
        "Business Continuity Planning: Comprehensive plans for maintaining operations during various disaster scenarios and security incidents.",
        "Geographic Redundancy: Multiple data centers in different geographic locations ensuring service continuity during regional disasters."
      ]
    },
    {
      id: "threat-intelligence",
      title: "Threat Intelligence and Analysis",
      icon: Zap,
      content: [
        "Threat Intelligence Feeds: Integration with national and international threat intelligence sources providing real-time threat indicators.",
        "Threat Hunting: Proactive threat hunting activities to identify advanced persistent threats (APTs) and sophisticated attack campaigns.",
        "Risk Assessment: Regular risk assessments identifying emerging threats, vulnerabilities, and potential impacts on evidence integrity.",
        "Intelligence Sharing: Participation in information sharing networks with law enforcement, intelligence agencies, and cybersecurity organizations.",
        "Threat Modeling: Systematic threat modeling for system components, attack vectors, and mitigation strategies.",
        "Predictive Analysis: AI-powered predictive analysis for emerging threats and proactive security measure implementation."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-800 text-white">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Lock className="w-16 h-16 text-red-200" />
              <Shield className="w-12 h-12 text-red-300" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Security Policy
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Comprehensive Security Framework for Digital Evidence Protection
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-red-200">
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

      {/* Security Commitment */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
          <div className="flex items-start">
            <Lock className="w-6 h-6 text-red-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Security Commitment</h3>
              <p className="text-red-700 leading-relaxed">
                LEGALVAULT implements the highest standards of cybersecurity to protect critical digital evidence and sensitive law enforcement data. Our multi-layered security approach ensures evidence integrity, confidentiality, and availability while maintaining compliance with national security requirements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Content */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-red-600" />
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

        {/* Security Metrics Dashboard */}
        <div className="mt-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Security Metrics & Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-gray-900">99.99%</h3>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-gray-900">256-bit</h3>
                <p className="text-sm text-gray-600">AES Encryption</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Key className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-gray-900">4096-bit</h3>
                <p className="text-sm text-gray-600">RSA Keys</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Activity className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold text-gray-900">24/7</h3>
                <p className="text-sm text-gray-600">SOC Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Security Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <h3 className="font-semibold mb-2">Security Incidents</h3>
                <p className="text-gray-300">security@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5684 (24/7)</p>
              </div>
              <div>
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-semibold mb-2">Vulnerability Reports</h3>
                <p className="text-gray-300">vulns@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5685</p>
              </div>
              <div>
                <Eye className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold mb-2">SOC Operations</h3>
                <p className="text-gray-300">soc@legalvault.gov.in</p>
                <p className="text-gray-300">+91-11-2334-5686 (24/7)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;