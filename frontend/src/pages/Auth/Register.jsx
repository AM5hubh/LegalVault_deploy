import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Scale,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  Building,
  Shield,
} from "lucide-react";
import KYCModal from "../../components/KYCModal";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agency: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isReady, user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Redirect if already logged in
  useEffect(() => {
    if (isReady && isAuthenticated && user) {
      const dashboardRoutes = {
        admin: "/admin-dashboard",
        police: "/police-dashboard",
        lawyer: "/lawyer-dashboard",
        judge: "/judge-dashboard",
        forensic_expert: "/forensic-dashboard",
        user: "/dashboard",
      };
      const redirectPath = dashboardRoutes[user.role] || "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isReady, isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "user", // Fixed role as 'user'
          agency: formData.agency || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Account created! Please verify your Aadhaar to complete registration.",
        );
        setTempUserData({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          userId: data.userId || null,
        });
        setShowKYCModal(true);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKYCSuccess = () => {
    // KYC verification successful during registration
    setShowKYCModal(false);
    setSuccess(
      "Registration and KYC verification complete! Redirecting to login...",
    );

    setTimeout(() => {
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please log in with your credentials.",
          email: tempUserData.email,
        },
      });
    }, 2000);
  };

  const handleKYCClose = () => {
    // User can skip KYC during registration
    setShowKYCModal(false);
    setSuccess(
      "Account created! You can verify your Aadhaar anytime from your profile.",
    );

    setTimeout(() => {
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please log in to access your account.",
          email: tempUserData.email,
        },
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join LEGALVAULT
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure Blockchain Evidence Management System
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Government of India | Ministry of Law & Justice
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="agency"
                className="block text-sm font-medium text-gray-700"
              >
                <Building className="w-4 h-4 inline mr-1" />
                Agency/Organization (Optional)
              </label>
              <input
                id="agency"
                name="agency"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your agency or organization"
                value={formData.agency}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Info Display */}
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Account Type:</strong> Standard User
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All new accounts are created as standard users. Contact your
                administrator for role upgrades.
              </p>
            </div>

            {/* Aadhaar KYC Notice */}
            <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-md p-3">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                <strong>Aadhaar Verification:</strong> After registration,
                you'll need to verify your Aadhaar number for compliance with
                Government of India regulations.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-orange-600 hover:text-orange-500"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-orange-600 hover:text-orange-500"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Secured by Blockchain Technology & Aadhaar Authentication</p>
          <p className="mt-1">
            © 2024 Government of India. All rights reserved.
          </p>
        </div>
      </div>

      {/* KYC Modal for Registration */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={handleKYCClose}
        onSuccess={handleKYCSuccess}
        requiresKyc={true}
      />
    </div>
  );
};

export default Register;
