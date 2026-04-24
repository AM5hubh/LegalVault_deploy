const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class ApiHealthService {
  static getHealthInfo(req) {
    return {
      status: 'OK',
      service: 'LEGALVAULT API',
      description: 'Comprehensive Digital Legal Resource Platform for Indian Legal Acts & Penal Codes',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      
      // Site Information
      siteInfo: {
        name: 'LEGALVAULT',
        tagline: 'Digital Legal Resource Platform',
        description: 'Access comprehensive collection of Indian legal acts, penal codes, and legal provisions. Perfect for lawyers, law students, legal professionals, and researchers.',
        features: [
          'Complete Indian Penal Code (IPC) 1860',
          'Code of Criminal Procedure (CrPC) 1973',
          'Civil Procedure Code (CPC) 1908',
          'Indian Evidence Act (IEA) 1872',
          'Hindu Marriage Act (HMA) 1955',
          'Indian Divorce Act (IDA) 1869',
          'Motor Vehicles Act (MVA) 1988',
          'Negotiable Instruments Act (NIA) 1881',
          'Advanced Search & Filtering',
          'Bookmark & Save Sections',
          'Digital Evidence Management',
          'Chain of Custody Tracking',
          'KYC Verification System',
          'Case Management Tools',
          'Secure Document Storage',
          'AI-Enhanced Legal Research'
        ],
        targetAudience: [
          'Legal Professionals & Lawyers',
          'Law Students & Researchers',
          'Police Officers & Law Enforcement',
          'Judges & Judicial Staff',
          'Legal Academics & Scholars',
          'Government Officials',
          'Legal Consultants'
        ]
      },

      // Database Status
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        name: 'MongoDB',
        host: process.env.MONGO_URI ? process.env.MONGO_URI.split('@')[1]?.split('/')[0] || 'localhost' : 'localhost',
        readyState: this.getDatabaseReadyState(mongoose.connection.readyState)
      },

      // API Documentation
      apiDocumentation: {
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        version: 'v1',
        contentType: 'application/json',
        
        endpoints: {
          // Authentication Endpoints
          authentication: {
            baseRoute: '/auth',
            description: 'User authentication and authorization',
            endpoints: [
              {
                method: 'POST',
                path: '/auth/register',
                description: 'Register a new user account',
                requiresAuth: false,
                body: {
                  name: 'string (required)',
                  email: 'string (required)',
                  password: 'string (required, min 6 chars)',
                  role: 'string (optional: lawyer, judge, police, admin)'
                },
                response: {
                  success: 'boolean',
                  message: 'string',
                  user: 'object',
                  token: 'string (JWT)'
                }
              },
              {
                method: 'POST',
                path: '/auth/login',
                description: 'Login with existing credentials',
                requiresAuth: false,
                body: {
                  email: 'string (required)',
                  password: 'string (required)'
                },
                response: {
                  success: 'boolean',
                  message: 'string',
                  user: 'object',
                  token: 'string (JWT)'
                }
              },
              {
                method: 'GET',
                path: '/auth/profile',
                description: 'Get current user profile',
                requiresAuth: true,
                headers: {
                  Authorization: 'Bearer <JWT_TOKEN>'
                },
                response: {
                  success: 'boolean',
                  user: 'object'
                }
              },
              {
                method: 'PUT',
                path: '/auth/profile',
                description: 'Update user profile',
                requiresAuth: true,
                headers: {
                  Authorization: 'Bearer <JWT_TOKEN>'
                },
                body: {
                  name: 'string (optional)',
                  email: 'string (optional)',
                  phone: 'string (optional)',
                  specialization: 'string (optional)'
                }
              }
            ]
          },

          // Contact Endpoints
          contact: {
            baseRoute: '/contact',
            description: 'Contact form and communication management',
            endpoints: [
              {
                method: 'POST',
                path: '/contact',
                description: 'Submit a contact form message',
                requiresAuth: false,
                body: {
                  name: 'string (required)',
                  email: 'string (required)',
                  subject: 'string (required)',
                  message: 'string (required)',
                  category: 'string (optional: general, technical, legal)'
                },
                response: {
                  success: 'boolean',
                  message: 'string',
                  contactId: 'string'
                }
              },
              {
                method: 'GET',
                path: '/contact',
                description: 'Get all contact messages (Admin only)',
                requiresAuth: true,
                requiredRole: 'admin',
                response: {
                  success: 'boolean',
                  contacts: 'array'
                }
              }
            ]
          },

          // KYC Verification Endpoints
          kyc: {
            baseRoute: '/kyc',
            description: 'Know Your Customer verification system',
            endpoints: [
              {
                method: 'POST',
                path: '/kyc/submit',
                description: 'Submit KYC documents for verification',
                requiresAuth: true,
                body: {
                  documentType: 'string (required: aadhar, pan, passport, license)',
                  documentNumber: 'string (required)',
                  documents: 'array (file uploads)',
                  personalInfo: 'object'
                },
                response: {
                  success: 'boolean',
                  message: 'string',
                  kycId: 'string',
                  status: 'pending'
                }
              },
              {
                method: 'GET',
                path: '/kyc/status',
                description: 'Check KYC verification status',
                requiresAuth: true,
                response: {
                  success: 'boolean',
                  status: 'string (pending, approved, rejected)',
                  submittedAt: 'string (ISO date)',
                  verifiedAt: 'string (ISO date, if approved)'
                }
              }
            ]
          },

          // Cases Management Endpoints
          cases: {
            baseRoute: '/cases',
            description: 'Legal case management and tracking',
            endpoints: [
              {
                method: 'POST',
                path: '/cases',
                description: 'Create a new legal case',
                requiresAuth: true,
                body: {
                  title: 'string (required)',
                  description: 'string (required)',
                  caseType: 'string (required: civil, criminal, family, commercial)',
                  priority: 'string (low, medium, high, urgent)',
                  clientName: 'string (required)',
                  clientContact: 'object',
                  documents: 'array (optional)'
                },
                response: {
                  success: 'boolean',
                  message: 'string',
                  case: 'object',
                  caseId: 'string'
                }
              },
              {
                method: 'GET',
                path: '/cases',
                description: 'Get all cases for current user',
                requiresAuth: true,
                queryParams: {
                  page: 'number (optional, default: 1)',
                  limit: 'number (optional, default: 10)',
                  status: 'string (optional: active, closed, pending)',
                  caseType: 'string (optional)',
                  search: 'string (optional)'
                },
                response: {
                  success: 'boolean',
                  cases: 'array',
                  pagination: 'object'
                }
              },
              {
                method: 'GET',
                path: '/cases/:id',
                description: 'Get specific case details',
                requiresAuth: true,
                response: {
                  success: 'boolean',
                  case: 'object'
                }
              },
              {
                method: 'PUT',
                path: '/cases/:id',
                description: 'Update case information',
                requiresAuth: true,
                body: {
                  title: 'string (optional)',
                  description: 'string (optional)',
                  status: 'string (optional)',
                  priority: 'string (optional)',
                  notes: 'string (optional)'
                }
              },
              {
                method: 'DELETE',
                path: '/cases/:id',
                description: 'Delete a case (Authorized users only)',
                requiresAuth: true
              }
            ]
          }
        },

        // Legal Acts Data Endpoints (Frontend Static)
        legalData: {
          description: 'Indian Legal Acts and Penal Codes (Static JSON Data)',
          availableActs: [
            {
              act: 'Indian Penal Code (IPC)',
              year: 1860,
              sections: '511 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/ipc.json'
            },
            {
              act: 'Code of Criminal Procedure (CrPC)',
              year: 1973,
              sections: '484 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/crpc.json'
            },
            {
              act: 'Civil Procedure Code (CPC)',
              year: 1908,
              sections: '158 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/cpc.json'
            },
            {
              act: 'Indian Evidence Act (IEA)',
              year: 1872,
              sections: '167 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/iea.json'
            },
            {
              act: 'Hindu Marriage Act (HMA)',
              year: 1955,
              sections: '30 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/hma.json'
            },
            {
              act: 'Indian Divorce Act (IDA)',
              year: 1869,
              sections: '52 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/ida.json'
            },
            {
              act: 'Motor Vehicles Act (MVA)',
              year: 1988,
              sections: '223 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/MVA.json'
            },
            {
              act: 'Negotiable Instruments Act (NIA)',
              year: 1881,
              sections: '147 sections',
              file: '/src/pages/Lawyer/LawPenalJsons/nia.json'
            }
          ]
        },

        // Authentication & Security
        security: {
          authentication: 'JWT (JSON Web Token)',
          tokenExpiration: '24 hours',
          passwordEncryption: 'bcrypt',
          rateLimiting: 'Enabled',
          corsPolicy: 'Configured for cross-origin requests',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <your-jwt-token>'
          }
        },

        // Error Codes
        errorCodes: {
          400: 'Bad Request - Invalid request format or missing required fields',
          401: 'Unauthorized - Invalid or missing authentication token',
          403: 'Forbidden - Insufficient permissions for this resource',
          404: 'Not Found - Requested resource does not exist',
          409: 'Conflict - Resource already exists or conflict with current state',
          429: 'Too Many Requests - Rate limit exceeded',
          500: 'Internal Server Error - Server encountered an unexpected error'
        },

        // Rate Limits
        rateLimits: {
          general: '100 requests per 15 minutes',
          auth: '5 login attempts per 15 minutes',
          contact: '3 submissions per hour',
          kyc: '1 submission per day'
        }
      },

      // System Information
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          free: `${Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024)} MB`
        },
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : 'N/A (Windows)'
      },

      // Links
      links: {
        documentation: `${req.protocol}://${req.get('host')}/api/health`,
        apiDocs: `${req.protocol}://${req.get('host')}/api/docs`,
        frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
        repository: 'https://github.com/legalvault/legalvault-platform',
        support: 'support@legalvault.com'
      },

      // Contact Information
      contact: {
        email: 'info@legalvault.com',
        support: 'support@legalvault.com',
        technical: 'tech@legalvault.com',
        website: 'https://legalvault.com'
      }
    };
  }

  static getQuickDocs(req) {
    return {
      title: 'LEGALVAULT API Documentation',
      description: 'Quick reference guide for LEGALVAULT API endpoints',
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      
      quickStart: {
        1: 'Register: POST /api/auth/register',
        2: 'Login: POST /api/auth/login',
        3: 'Get Profile: GET /api/auth/profile (with Authorization header)',
        4: 'Submit Contact: POST /api/contact',
        5: 'Create Case: POST /api/cases (with Authorization header)'
      },

      authExample: {
        register: {
          url: '/api/auth/register',
          method: 'POST',
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'lawyer'
          }
        },
        login: {
          url: '/api/auth/login',
          method: 'POST',
          body: {
            email: 'john@example.com',
            password: 'password123'
          }
        }
      },

      curlExamples: {
        register: `curl -X POST ${req.protocol}://${req.get('host')}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"lawyer"}'`,
        
        login: `curl -X POST ${req.protocol}://${req.get('host')}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"password123"}'`,
        
        profile: `curl -X GET ${req.protocol}://${req.get('host')}/api/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
      },

      note: 'For complete documentation, visit /api/health'
    };
  }

  static getRootInfo(req) {
    return {
      message: 'Welcome to LEGALVAULT API',
      description: 'Digital Legal Resource Platform for Indian Legal Acts & Penal Codes',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        auth: '/api/auth',
        contact: '/api/contact',
        kyc: '/api/kyc',
        cases: '/api/cases'
      },
      availableRoutes: [
        'GET /',
        'GET /api/health',
        'GET /api/docs',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'POST /api/contact',
        'GET /api/contact',
        'POST /api/kyc/submit',
        'GET /api/kyc/status',
        'POST /api/cases',
        'GET /api/cases',
        'GET /api/cases/:id'
      ]
    };
  }

  static getDatabaseReadyState(state) {
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    return states[state] || 'Unknown';
  }
}

module.exports = ApiHealthService;