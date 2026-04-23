import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Scale,
    Shield,
    Users,
    Globe,
    Award,
    Target,
    Heart,
    TrendingUp,
    CheckCircle,
    Zap,
    Lock,
    BookOpen,
    Building,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    ArrowRight,
    Eye,
    Lightbulb,
    Handshake,
    FileText,
    Camera,
    Image,
    Upload,
    Brain,
    Database,
    Key,
    Clock
} from 'lucide-react';
import { BlogGrid } from '../components/BlogCard';
import axios from 'axios';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [blogsLoading, setBlogsLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:5000/api';

    // Get user from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Fetch latest blogs for dashboard
    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                setBlogsLoading(true);
                const response = await axios.get(`${API_BASE_URL}/blogs?limit=6`);
                if (response.data.success) {
                    setLatestBlogs(response.data.blogs);
                }
            } catch (error) {
                console.error('Error fetching latest blogs:', error);
            } finally {
                setBlogsLoading(false);
            }
        };

        fetchLatestBlogs();
    }, []);

    const stats = [
        { label: 'Evidence Secured', value: '100,000+', icon: Shield },
        { label: 'Active Users', value: '5,000+', icon: Users },
        { label: 'Cases Processed', value: '25,000+', icon: FileText },
        { label: 'AI Enhancements', value: '50,000+', icon: Brain }
    ];

    const features = [
        {
            icon: Shield,
            title: 'Blockchain Security',
            description: 'Immutable evidence storage using blockchain technology to ensure authenticity and prevent tampering.'
        },
        {
            icon: Upload,
            title: 'Multi-Format Upload',
            description: 'Upload CCTV footage, images, documents, and audio files with automatic hash generation and IPFS storage.'
        },
        {
            icon: Key,
            title: 'Role-Based Access',
            description: 'Granular access control for law enforcement, forensic experts, and legal authorities with multi-factor authentication.'
        },
        {
            icon: Clock,
            title: 'Chain of Custody',
            description: 'Complete audit trail tracking every access, modification, and transfer of evidence with timestamp verification.'
        },
        {
            icon: Brain,
            title: 'AI Enhancement Tools',
            description: 'Advanced AI for image enhancement including super-resolution, noise reduction, and contrast adjustment for CCTV footage.'
        },
        {
            icon: Database,
            title: 'Decentralized Storage',
            description: 'Secure IPFS storage combined with blockchain hashes ensuring data availability and integrity without single points of failure.'
        }
    ];

    const benefits = [
        {
            icon: Target,
            title: 'Unbreakable Evidence Integrity',
            description: 'Cryptographic guarantees that evidence cannot be altered or manipulated once uploaded to the system.'
        },
        {
            icon: Zap,
            title: 'Lightning-Fast Processing',
            description: 'AI-powered analysis and enhancement tools that process evidence in seconds, not hours.'
        },
        {
            icon: Eye,
            title: 'Court-Admissible Results',
            description: 'Enhanced images and videos meet forensic standards and are legally admissible in court proceedings.'
        },
        {
            icon: Shield,
            title: 'Enterprise-Grade Security',
            description: 'Military-grade encryption, biometric authentication, and continuous security monitoring 24/7.'
        }
    ];

    const values = [
        {
            icon: Lock,
            title: 'Security First',
            description: 'Uncompromising security measures that protect sensitive evidence and maintain judicial integrity.'
        },
        {
            icon: Scale,
            title: 'Legal Compliance',
            description: 'Fully compliant with Indian evidence laws and international forensic standards.'
        },
        {
            icon: Users,
            title: 'Collaborative Justice',
            description: 'Seamless collaboration between all stakeholders in the criminal justice ecosystem.'
        },
        {
            icon: Lightbulb,
            title: 'Technological Innovation',
            description: 'Cutting-edge AI and blockchain solutions that redefine evidence management practices.'
        },
        {
            icon: Heart,
            title: 'Justice for All',
            description: 'Empowering law enforcement and judiciary with tools that ensure fair and swift justice delivery.'
        },
        {
            icon: Handshake,
            title: 'Trusted Partnership',
            description: 'Building trust through transparent processes and reliable technology that stands up in court.'
        }
    ];

    const howItWorks = [
        {
            step: 1,
            title: 'Upload Evidence',
            description: 'Securely upload CCTV footage, images, documents, or audio files through our intuitive interface.',
            icon: Upload
        },
        {
            step: 2,
            title: 'AI Enhancement',
            description: 'Our AI automatically analyzes and enhances low-quality evidence using advanced computer vision algorithms.',
            icon: Brain
        },
        {
            step: 3,
            title: 'Blockchain Verification',
            description: 'Evidence is stored on IPFS and its cryptographic hash is recorded on the blockchain for immutability.',
            icon: Shield
        },
        {
            step: 4,
            title: 'Access Control',
            description: 'Role-based permissions ensure only authorized personnel can access and interact with the evidence.',
            icon: Key
        },
        {
            step: 5,
            title: 'Chain of Custody',
            description: 'Every action is logged with timestamps creating an unbreakable audit trail for court admissibility.',
            icon: Clock
        }
    ];

    const requirements = [
        {
            title: 'For Law Enforcement Agencies',
            icon: Shield,
            description: 'Authorized police departments and law enforcement agencies handling criminal investigations.',
            items: [
                {
                    req: 'Official government ID (Police ID Card)',
                    detail: 'Valid government-issued police identification card of authorized personnel'
                },
                {
                    req: 'Department authorization letter',
                    detail: 'Signed by department chief/superintendent authorizing access to LEGALVAULT system'
                },
                {
                    req: 'Agency registration certificate',
                    detail: 'Official certificate of registration with the Ministry of Home Affairs'
                },
                {
                    req: 'Contact information of department head',
                    detail: 'Name, designation, phone number, and official email of authorized department head'
                },
                {
                    req: 'Technical infrastructure assessment',
                    detail: 'Details of existing cybersecurity infrastructure and compliance certifications'
                },
                {
                    req: 'Case log reference',
                    detail: 'Information about investigation cases requiring evidence management'
                }
            ]
        },
        {
            title: 'For Forensic Laboratories',
            icon: Brain,
            description: 'Government-accredited forensic laboratories and analysis centers.',
            items: [
                {
                    req: 'Forensic lab accreditation certificate',
                    detail: 'Valid accreditation from NABL (National Accreditation Board for Testing and Calibration)'
                },
                {
                    req: 'Government recognition documents',
                    detail: 'Official recognition letter from Ministry of Home Affairs or State Government'
                },
                {
                    req: 'Qualified forensic expert credentials',
                    detail: 'Credentials of certified forensic experts (minimum B.Sc. Forensics or equivalent)'
                },
                {
                    req: 'Laboratory infrastructure details',
                    detail: 'Details of equipment, storage facilities, and digital infrastructure'
                },
                {
                    req: 'Data security compliance certification',
                    detail: 'ISO 27001 certification or equivalent data security compliance certificate'
                },
                {
                    req: 'Chain of custody procedures',
                    detail: 'Documentation of established chain of custody protocols and procedures'
                }
            ]
        },
        {
            title: 'For Legal Authorities',
            icon: Scale,
            description: 'Judges, magistrates, advocates, and authorized legal practitioners.',
            items: [
                {
                    req: 'Court or judiciary identification',
                    detail: 'Official identification from district/high/supreme court or judicial authority'
                },
                {
                    req: 'Official appointment documents',
                    detail: 'Document proving current appointment as judge/magistrate/advocate in government office'
                },
                {
                    req: 'Case jurisdiction verification',
                    detail: 'Details of cases under jurisdiction with relevant case numbers and court assignments'
                },
                {
                    req: 'Professional legal practice license',
                    detail: 'Valid Bar Council registration or equivalent professional license'
                },
                {
                    req: 'Security clearance certificate',
                    detail: 'Security clearance certificate or government background verification document'
                },
                {
                    req: 'Oath of confidentiality',
                    detail: 'Signed oath of confidentiality regarding sensitive case information'
                }
            ]
        },
        {
            title: 'Technical Requirements',
            icon: Database,
            description: 'Minimum technical specifications required for all users.',
            items: [
                {
                    req: 'High-speed internet connection',
                    detail: 'Minimum 50 Mbps download/10 Mbps upload speed (100+ Mbps recommended for large files)'
                },
                {
                    req: 'Modern web browser',
                    detail: 'Latest versions of Chrome, Firefox, Edge, or Safari with JavaScript enabled'
                },
                {
                    req: 'System specifications',
                    detail: 'Minimum 8GB RAM, 256GB SSD storage, 4-core processor for AI processing'
                },
                {
                    req: 'Secure device with antivirus',
                    detail: 'Endpoint protection software and updated Windows Defender or equivalent'
                },
                {
                    req: 'VPN and encryption',
                    detail: 'VPN capability for secure connections, support for TLS 1.2 or higher'
                },
                {
                    req: 'Two-factor authentication',
                    detail: 'Compatible device for 2FA (authenticator app or security key recommended)'
                }
            ]
        }
    ];

    const [showRequirements, setShowRequirements] = React.useState(false);

    const handleRoleRequest = () => {
        // Redirect to admin request form
        window.location.href = '/role-request';
    };

    const toggleRequirements = () => {
        setShowRequirements(!showRequirements);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <Scale className="w-16 h-16 text-orange-600 mr-4" />
                        <h1 className="text-5xl font-bold text-gray-900">LEGALVAULT</h1>
                    </div>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                        Secure Blockchain-Based Digital Evidence Management System revolutionizing criminal investigations
                        through cutting-edge AI enhancement and unbreakable cryptographic security.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-8">
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Government of India Initiative
                        </span>
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Blockchain Secured
                        </span>
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            AI-Powered Enhancement
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleRoleRequest}
                            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center"
                        >
                            Request Admin Access
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        <button
                            onClick={toggleRequirements}
                            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center border-2 border-orange-600"
                        >
                            View Requirements
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Role-Based Quick Access Section */}
            {user && (
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {user.role === 'role_assigner' && (
                            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg shadow-lg p-8 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Hello, {user.fullName || user.email}!</h3>
                                        <p className="text-purple-100 mb-4">You have role verification requests waiting for your review.</p>
                                    </div>
                                    <Shield className="w-16 h-16 text-purple-200 opacity-50" />
                                </div>
                                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/role-assigner/dashboard"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Go to RoleAssigner Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to="/role-assigner/requests"
                                        className="inline-flex items-center justify-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Review Pending Requests
                                    </Link>
                                </div>
                            </div>
                        )}

                        {user.role === 'admin' && (
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg p-8 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Welcome, Administrator</h3>
                                        <p className="text-blue-100 mb-4">Manage system users, roles, and review role requests.</p>
                                    </div>
                                    <Shield className="w-16 h-16 text-blue-200 opacity-50" />
                                </div>
                                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/admin-dashboard"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Go to Admin Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to="/admin/role-requests"
                                        className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Review Verified Requests
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Statistics Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Icon className="w-8 h-8 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Latest Legal Articles Section - NEW */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Legal Insights</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Stay informed with expert analysis, case studies, and legal updates from India's top legal professionals
                        </p>
                    </div>

                    <BlogGrid posts={latestBlogs} loading={blogsLoading} />

                    <div className="text-center mt-8">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <BookOpen className="w-5 h-5" />
                            View All Articles
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Advanced technology platform designed specifically for digital evidence management
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                            <Icon className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                    </div>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Streamlined workflow from evidence upload to court presentation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {howItWorks.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-orange-600 mb-2">{step.step}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Benefits</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Transform your investigations with cutting-edge technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg p-8 flex items-start space-x-4 shadow-sm">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Icon className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Principles that guide our commitment to justice and technological excellence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Icon className="w-8 h-8 text-orange-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Requirements Modal */}
            {showRequirements && (
                <div className="fixed inset-0 k bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto relative border border-gray-200">
                        {/* Watermark Background */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                            <div className="text-center text-9xl font-bold text-gray-400 rotate-45 translate-x-20 whitespace-nowrap">
                                GOVERNMENT
                            </div>
                        </div>

                        {/* Official Header */}
                        <div className="p-6 lg:p-8 border-b-2 border-orange-600 bg-gradient-to-r from-orange-50 to-white relative z-10">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                        <Scale className="w-6 h-6 lg:w-8 lg:h-8" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-lg lg:text-xl font-bold text-gray-900">REPUBLIC OF INDIA</h1>
                                        <p className="text-xs lg:text-sm text-gray-600">Ministry of Law & Justice</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleRequirements}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">ACCESS REQUIREMENTS DOCUMENT</h2>
                            <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs text-gray-600 border-t border-gray-300 pt-4">
                                <div>
                                    <p><span className="font-semibold">Document No.:</span> LV/ARD/2025/001</p>
                                </div>
                                <div className="sm:text-right">
                                    <p><span className="font-semibold">Issued:</span> {new Date().toLocaleDateString('en-IN')}</p>
                                    <p><span className="font-semibold">Valid Until:</span> {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 lg:p-8 relative z-10">
                            {/* Introduction */}
                            <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded">
                                <p className="text-gray-800 font-semibold mb-2">PURPOSE & AUTHORIZATION</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    This document outlines the mandatory requirements and qualifications necessary for secure access to the LEGALVAULT Digital Evidence Management System. As a government-authorized platform handling sensitive evidence material, strict compliance is mandated by the Ministry of Law & Justice. All applicants must fulfill these requirements to ensure system integrity and legal admissibility of evidence.
                                </p>
                            </div>

                            {/* Requirements Grid */}
                            <div className="space-y-6 mb-8">
                                {requirements.map((req, index) => {
                                    const ReqIcon = req.icon;
                                    return (
                                        <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                                            {/* Section Header */}
                                            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center gap-4">
                                                <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <ReqIcon className="w-5 h-5 text-white flex-shrink-0" />
                                                    <h3 className="text-base lg:text-lg font-bold text-white truncate">
                                                        {req.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            
                                            {/* Section Description */}
                                            <div className="px-6 py-3 bg-orange-50 border-b border-gray-200">
                                                <p className="text-sm text-gray-700 italic">{req.description}</p>
                                            </div>

                                            {/* Section Content */}
                                            <div className="p-6 bg-white">
                                                <ul className="space-y-4">
                                                    {req.items.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="flex gap-4">
                                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-1 flex-shrink-0">
                                                                <CheckCircle className="w-4 h-4 text-orange-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-800 text-sm mb-1">
                                                                    {typeof item === 'string' ? item : item.req}
                                                                </p>
                                                                {typeof item !== 'string' && item.detail && (
                                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                                        {item.detail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Important Notes Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Important Notes */}
                                <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-lg">
                                    <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">!</span>
                                        IMPORTANT NOTES
                                    </h4>
                                    <ul className="text-sm text-amber-900 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0">→</span>
                                            <span>All documents must be current and government-issued</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0">→</span>
                                            <span>False information will result in permanent blacklisting</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0">→</span>
                                            <span>Access approval takes 3-5 business days</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0">→</span>
                                            <span>Security training is mandatory</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0">→</span>
                                            <span>All applicants undergo background verification</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Processing Timeline */}
                                <div className="p-6 bg-green-50 border-2 border-green-400 rounded-lg">
                                    <h4 className="font-bold text-green-900 mb-4 flex items-center gap-3">
                                        <Calendar className="w-5 h-5" />
                                        APPROVAL TIMELINE
                                    </h4>
                                    <div className="text-sm text-green-900 space-y-3">
                                        <div className="border-l-3 border-green-400 pl-3">
                                            <p className="font-semibold">Day 1:</p>
                                            <p className="text-xs">Application submission & document verification</p>
                                        </div>
                                        <div className="border-l-3 border-green-400 pl-3">
                                            <p className="font-semibold">Day 2-3:</p>
                                            <p className="text-xs">Background verification & compliance check</p>
                                        </div>
                                        <div className="border-l-3 border-green-400 pl-3">
                                            <p className="font-semibold">Day 4-5:</p>
                                            <p className="text-xs">Final approval & credential issuance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Notice */}
                            <div className="p-4 bg-gray-100 border-l-4 border-gray-400 rounded mb-8 text-xs text-gray-800">
                                <p className="font-bold mb-2">LEGAL NOTICE</p>
                                <p className="leading-relaxed">
                                    Unauthorized access, misuse, or breach of LEGALVAULT systems is a punishable offense under the Information Technology Act, 2000 and Indian Penal Code. All activities are monitored and logged. By submitting this application, you acknowledge and accept all terms and conditions.
                                </p>
                            </div>
                        </div>

                        {/* Official Footer */}
                        <div className="p-6 lg:p-8 border-t-2 border-orange-600 bg-gradient-to-r from-gray-50 to-white relative z-10">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-center text-xs text-gray-600">
                                <div>
                                    <p className="font-semibold">Authorized By</p>
                                    <p className="text-xs">Ministry of Law & Justice</p>
                                </div>
                                <div className="border-l border-r border-gray-300 hidden lg:block">
                                    <p className="font-semibold">Certification</p>
                                    <p className="text-xs">ISO 27001 Compliant</p>
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <p className="font-semibold">Support</p>
                                    <p className="text-xs truncate">compliance@legalvault.gov.in</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={toggleRequirements}
                                    className="px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors text-sm whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRoleRequest}
                                    className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 font-semibold transition-all shadow-lg text-sm whitespace-nowrap"
                                >
                                    Proceed with Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Awards & Recognition */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Industry-leading innovation in digital forensics and evidence management
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Award className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Forensics Excellence 2024</h3>
                            <p className="text-gray-600">Best Innovation in Evidence Technology</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Star className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Security Award</h3>
                            <p className="text-gray-600">Outstanding Security Implementation</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Shield className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">National Cybersecurity Excellence</h3>
                            <p className="text-gray-600">Government Security Innovation</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-16 bg-orange-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Ready to revolutionize your evidence management? Contact our team to learn more.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
                            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                            <p className="opacity-90">info@legalvault.gov.in</p>
                            <p className="opacity-90">support@legalvault.gov.in</p>
                        </div>

                        <div>
                            <Phone className="w-12 h-12 mx-auto mb-4 opacity-90" />
                            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                            <p className="opacity-90">1800-123-LEGAL</p>
                            <p className="opacity-90">(24/7 Support)</p>
                        </div>

                        <div>
                            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-90" />
                            <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                            <p className="opacity-90">Ministry of Law & Justice</p>
                            <p className="opacity-90">New Delhi, India</p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <button 
                            onClick={handleRoleRequest}
                            className="inline-flex items-center bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Request Access Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Scale className="w-8 h-8 text-orange-600 mr-3" />
                        <span className="text-xl font-bold">LEGALVAULT</span>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Secure Blockchain-Based Digital Evidence Management System | Government of India
                    </p>
                    <div className="flex justify-center space-x-6 text-sm text-gray-400">
                        <span>© 2025 Government of India</span>
                        <span>•</span>
                        <span>Ministry of Law & Justice</span>
                        <span>•</span>
                        <span>All Rights Reserved</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;