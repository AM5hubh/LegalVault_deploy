import React from 'react';
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
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const AboutUs = () => {
    const stats = [
        { label: 'Cases Managed', value: '50,000+', icon: Scale },
        { label: 'Government Agencies', value: '500+', icon: Building },
        { label: 'Legal Professionals', value: '10,000+', icon: Users },
        { label: 'Years of Service', value: '5+', icon: Calendar }
    ];

    const features = [
        {
            icon: Shield,
            title: 'Secure Evidence Management',
            description: 'Bank-level security with blockchain technology ensuring evidence integrity and chain of custody.'
        },
        {
            icon: Zap,
            title: 'Real-time Collaboration',
            description: 'Seamless collaboration between police, lawyers, judges, and forensic experts in real-time.'
        },
        {
            icon: Lock,
            title: 'Compliance & Audit',
            description: 'Full compliance with Indian legal standards and comprehensive audit trails for all activities.'
        },
        {
            icon: Globe,
            title: 'Multi-jurisdiction Support',
            description: 'Support for cases across different states and jurisdictions with unified case management.'
        },
        {
            icon: BookOpen,
            title: 'Legal Research Tools',
            description: 'Integrated legal research with access to case laws, statutes, and legal precedents.'
        },
        {
            icon: TrendingUp,
            title: 'Analytics & Insights',
            description: 'Advanced analytics providing insights into case patterns and system performance.'
        }
    ];

    const values = [
        {
            icon: Eye,
            title: 'Transparency',
            description: 'Complete transparency in all legal processes with full audit trails and accountability.'
        },
        {
            icon: Shield,
            title: 'Security',
            description: 'Uncompromising security standards protecting sensitive legal data and evidence.'
        },
        {
            icon: Users,
            title: 'Collaboration',
            description: 'Fostering seamless collaboration between all stakeholders in the legal ecosystem.'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'Continuous innovation in legal technology to improve justice delivery.'
        },
        {
            icon: Heart,
            title: 'Service',
            description: 'Dedicated service to justice and the rule of law in democratic India.'
        },
        {
            icon: Handshake,
            title: 'Trust',
            description: 'Building trust through reliable, accurate, and consistent service delivery.'
        }
    ];

    const milestones = [
        {
            year: '1950',
            title: 'Constitution of India',
            description: 'Adoption of the Constitution, establishing the foundation for India\'s legal framework.'
        },
        {
            year: '1973',
            title: 'Code of Criminal Procedure',
            description: 'Introduction of CrPC, standardizing criminal justice procedures across India.'
        },
        {
            year: '2000',
            title: 'Information Technology Act',
            description: 'Enacted to address cybercrimes and provide legal recognition to electronic records.'
        },
        {
            year: '2013',
            title: 'Companies Act',
            description: 'Modernized corporate governance with enhanced transparency and compliance.'
        },
        {
            year: '2019',
            title: 'Digital India Legal Initiative',
            description: 'Launch of LEGALVAULT to digitize evidence and case management.'
        },
        {
            year: '2023',
            title: 'Blockchain Evidence System',
            description: 'Nationwide adoption of blockchain for secure evidence management.'
        }
    ];

    const faqs = [
        {
            question: 'What is LEGALVAULT?',
            answer: 'LEGALVAULT is India’s premier digital evidence management system designed to modernize the legal ecosystem through secure, transparent, and efficient technology.'
        },
        {
            question: 'How does LEGALVAULT ensure evidence security?',
            answer: 'LEGALVAULT uses bank-level encryption and blockchain technology to ensure the integrity and chain of custody for all evidence.'
        },
        {
            question: 'Who can use LEGALVAULT?',
            answer: 'LEGALVAULT is designed for legal professionals, law enforcement agencies, government bodies, and forensic experts involved in the Indian legal system.'
        },
        {
            question: 'Is LEGALVAULT compliant with Indian laws?',
            answer: 'Yes, LEGALVAULT is fully compliant with Indian legal standards, including the Information Technology Act and other relevant regulations.'
        },
        {
            question: 'How does LEGALVAULT support multi-jurisdiction cases?',
            answer: 'LEGALVAULT provides a unified platform that supports case management across different states and jurisdictions in India.'
        },
        {
            question: 'How can I get support for LEGALVAULT?',
            answer: 'You can reach out via email at support@legalvault.gov.in or call our 24/7 support line at 1800-123-LEGAL.'
        }
    ];

    const [openFaq, setOpenFaq] = React.useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
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
                        India's premier digital evidence management system, revolutionizing the legal ecosystem
                        through technology, transparency, and trust.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Government of India Initiative
                        </span>
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Digital India Certified
                        </span>
                        <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            ISO 27001 Compliant
                        </span>
                    </div>
                </div>
            </section>

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

            {/* Mission & Vision Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Mission */}
                        <div className="bg-orange-50 rounded-lg p-8">
                            <div className="flex items-center mb-6">
                                <Target className="w-8 h-8 text-orange-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                To modernize India's legal system through cutting-edge technology, ensuring swift justice
                                delivery, complete transparency, and uncompromising security in evidence management. We strive
                                to create a unified digital ecosystem that connects all stakeholders in the legal process.
                            </p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">Digitize legal processes nationwide</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">Ensure evidence integrity and chain of custody</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">Accelerate justice delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* Vision */}
                        <div className="bg-green-50 rounded-lg p-8">
                            <div className="flex items-center mb-6">
                                <Eye className="w-8 h-8 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                To establish India as a global leader in digital justice systems, where every citizen has
                                access to fast, fair, and transparent legal processes. We envision a future where technology
                                eliminates barriers to justice and strengthens the rule of law.
                            </p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">100% digital legal ecosystem</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">AI-powered legal assistance</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-gray-700">Global benchmark for digital justice</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Answers to common questions about LEGALVAULT
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <button
                                    className="w-full flex justify-between items-center text-left"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-6 h-6 text-orange-600" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-orange-600" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <p className="mt-4 text-gray-600">{faq.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Comprehensive digital tools designed specifically for the Indian legal system
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

            {/* Values Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The principles that guide our commitment to justice and excellence
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

            {/* Timeline Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">India's Legal Revolution</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Key milestones in the evolution of India's legal framework
                        </p>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-200"></div>

                        <div className="space-y-12">
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <div className="text-2xl font-bold text-orange-600 mb-2">{milestone.year}</div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                                            <p className="text-gray-600">{milestone.description}</p>
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-center w-16 h-16">
                                        <div className="w-4 h-4 bg-orange-600 rounded-full border-4 border-white shadow-lg"></div>
                                    </div>
                                    <div className="w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

         

            {/* Awards & Recognition */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Recognized for excellence in digital governance and legal innovation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Award className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital India Award 2023</h3>
                            <p className="text-gray-600">Excellence in Digital Governance</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Star className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">National e-Governance Award</h3>
                            <p className="text-gray-600">Best Citizen Service Initiative</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <Shield className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ISO 27001 Certification</h3>
                            <p className="text-gray-600">Information Security Management</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-16 bg-orange-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Have questions about LEGALVAULT? We're here to help.
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
                        <a
                            href="/contact"
                            className="inline-flex items-center bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Contact Us
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
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
                        Digital Evidence Management System | Government of India
                    </p>
                    <div className="flex justify-center space-x-6 text-sm text-gray-400">
                        <span>© 2024 Government of India</span>
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

export default AboutUs;