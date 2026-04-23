import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Scale, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import KYCModal from "../../components/KYCModal";
import { useAuth } from "../../context/AuthContext";
const dashboardRoutes = {
  admin: "/admin-dashboard",
  police: "/police-dashboard",
  lawyer: "/lawyer-dashboard",
  judge: "/judge-dashboard",
  forensic_expert: "/forensic-dashboard",
  user: "/dashboard",
};
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycRequired, setKycRequired] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, isReady, user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Redirect if already logged in
  useEffect(() => {
    if (isReady && isAuthenticated && user) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if KYC is required for this user
        if (data.user.kycStatus !== "verified") {
          // Store token and user data temporarily
          setTempToken(data.token);
          setTempUserData(data.user);
          setKycRequired(true);
          setShowKYCModal(true);
        } else {
          // Complete login and redirect
          completeLogin(data);
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    // Store user data and token in context + storage
    login(data.user, data.token);

    // Redirect based on role
    // const dashboardRoutes = {
    //   admin: "/admin-dashboard",
    //   police: "/police-dashboard",
    //   lawyer: "/lawyer-dashboard",
    //   judge: "/judge-dashboard",
    //   forensic_expert: "/forensic-dashboard",
    //   user: "/dashboard",
    // };

    const redirectPath = dashboardRoutes[data.user.role] || "/dashboard";
    navigate(redirectPath);
  };

  const handleKYCSuccess = () => {
    // KYC verification successful
    // Use stored token and user data to complete login
    if (tempToken && tempUserData) {
      const userData = {
        ...tempUserData,
        kycStatus: "verified",
      };

      login(userData, tempToken);

      setShowKYCModal(false);

      // Redirect based on role
      // const dashboardRoutes = {
      //   admin: "/admin-dashboard",
      //   police: "/police-dashboard",
      //   lawyer: "/lawyer-dashboard",
      //   judge: "/judge-dashboard",
      //   forensic_expert: "/forensic-dashboard",
      //   user: "/dashboard",
      // };

      const redirectPath = dashboardRoutes[tempUserData.role] || "/dashboard";
      navigate(redirectPath);
    }
  };

  const handleKYCClose = () => {
    setShowKYCModal(false);
    setTempUserData(null);
    setTempToken(null);
    setKycRequired(false);
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
            LEGALVAULT
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure Blockchain Evidence Management System
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Government of India | Ministry of Law & Justice
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
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
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* KYC Notice */}
            <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-md p-3">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <strong>Aadhaar KYC Required:</strong> Some features require
                Aadhaar verification for compliance with Government of India
                regulations.
              </p>
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
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
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
                  New to the system?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Create your account
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

      {/* KYC Modal */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={handleKYCClose}
        onSuccess={handleKYCSuccess}
        requiresKyc={kycRequired}
      />
    </div>
  );
};

export default Login;
