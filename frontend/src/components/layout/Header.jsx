import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Shield,
  Menu,
  X,
  Phone,
  FileText,
  Info,
} from "lucide-react";
import WalletConnect from "../WalletConnect";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getDisplayName = (user) => {
    return user?.fullName || user?.name || user?.email?.split("@")[0] || "User";
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      admin: "Administrator",
      role_assigner: "Role Assigner",
      police: "Police Officer",
      lawyer: "Legal Counsel",
      judge: "Judge",
      forensic_expert: "Forensic Expert",
      user: "User",
    };
    return roleMap[role] || role;
  };

  const getDashboardRoute = (role) => {
    const routeMap = {
      admin: "/admin-dashboard",
      role_assigner: "/role-assigner/dashboard",
      police: "/police-dashboard",
      lawyer: "/lawyer-dashboard",
      judge: "/judge-dashboard",
      forensic_expert: "/forensic-dashboard",
    };
    return routeMap[role] || "/dashboard";
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Show loading or redirect if no user
  if (!user) {
    return (
      <header className="bg-linear-to-r from-orange-600 via-white to-green-600 shadow-lg border-b-2 border-orange-500 fixed w-full top-0 z-50">
        <div className="bg-orange-700 text-white py-0.5">
          <div className="max-w-7xl mx-auto px-4 text-xs text-center">
            Government of India | Ministry of Law & Justice | Digital India
            Initiative
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-linear-to-r from-orange-600 via-white to-green-600 shadow-lg border-b-2 border-orange-500 fixed w-full top-0 z-50">
      {/* Government Banner - Reduced height */}
      <div className="bg-orange-700 text-white py-0.5">
        <div className="max-w-7xl mx-auto px-4 text-xs text-center">
          Government of India | Ministry of Law & Justice | Digital India
          Initiative
        </div>
      </div>

      {/* Main Header - Reduced height */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
            >
              <Scale className="w-6 h-6 text-orange-600" />
              <div className="text-lg font-bold text-gray-900">LEGALVAULT</div>
            </button>
            <div className="hidden lg:block text-xs text-gray-600">
              Digital Evidence Management System
            </div>
          </div>

          {/* Desktop Navigation - Compact */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dashboard Link */}
            <button
              onClick={() => navigate(getDashboardRoute(user.role))}
              className="text-gray-700 hover:text-orange-600 transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
            >
              Dashboard
            </button>

            {/* Cases Link - Available to all users */}
            <button
              onClick={() => navigate("/cases")}
              className="flex items-center text-gray-700 hover:text-orange-600 transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
            >
              <FileText className="w-3 h-3 mr-1" />
              Cases
            </button>

            {/* About Link */}
            <button
              onClick={() => navigate("/about")}
              className="flex items-center text-gray-700 hover:text-orange-600 transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
            >
              <Info className="w-3 h-3 mr-1" />
              About
            </button>

            {/* Contact Us Link */}
            <button
              onClick={() => navigate("/contact")}
              className="flex items-center text-gray-700 hover:text-orange-600 transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
            >
              <Phone className="w-3 h-3 mr-1" />
              Contact
            </button>

            {/* Role-specific links */}
            {user.role === "admin" && (
              <>
                <button
                  onClick={() => navigate("/admin/users-management")}
                  className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
                >
                  Users
                </button>
                <button
                  onClick={() => navigate("/admin/role-requests")}
                  className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
                >
                  Role Requests
                </button>
                <button
                  onClick={() => navigate("/admin/contact-management")}
                  className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
                >
                  Messages
                </button>
              </>
            )}

            {user.role === "role_assigner" && (
              <button
                onClick={() => navigate("/role-assigner/requests")}
                className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
              >
                Verify Requests
              </button>
            )}

            {user.role === "role_assigner" && (
              <button
                onClick={() => navigate("/role-assigner/requests")}
                className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
              >
                Verify Requests
              </button>
            )}

            {(user.role === "police" || user.role === "admin") && (
              <button
                onClick={() => navigate("/evidence")}
                className="text-gray-700 hover:text-orange-600 transition-colors text-sm bg-transparent border-none cursor-pointer"
              >
                Evidence
              </button>
            )}

            {/* Wallet Connect Button - Only for eligible roles */}
            <WalletConnect user={user} isCompact={true} />

            {/* Notifications - Compact */}
            <button className="relative p-1 text-gray-700 hover:text-orange-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown - Compact with higher z-index */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getInitials(getDisplayName(user))}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-medium text-gray-900">
                    {getDisplayName(user)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {getRoleDisplayName(user.role)}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* Dropdown Menu with higher z-index and backdrop */}
              {isDropdownOpen && (
                <>
                  {/* Invisible backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-60">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(getDisplayName(user))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {getDisplayName(user)}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {user.email}
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate(getDashboardRoute(user.role));
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate("/security");
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Security
                      </button>
                    </div>

                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-gray-700 hover:text-orange-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with higher z-index */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile Menu Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Mobile Menu */}
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-60 md:hidden">
              <div className="px-4 py-2 space-y-1">
                {/* Mobile User Info - Compact */}
                <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(getDisplayName(user))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm">
                      {getDisplayName(user)}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.email}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <button
                  onClick={() => {
                    navigate(getDashboardRoute(user.role));
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    navigate("/cases");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Cases
                </button>

                <button
                  onClick={() => {
                    navigate("/about");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Info className="w-4 h-4 mr-2" />
                  About
                </button>

                <button
                  onClick={() => {
                    navigate("/contact");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Us
                </button>

                {user.role === "admin" && (
                  <>
                    <button
                      onClick={() => {
                        navigate("/admin/users-management");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Users Management
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/contact-management");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Contact Messages
                    </button>
                  </>
                )}

                {(user.role === "police" || user.role === "admin") && (
                  <button
                    onClick={() => {
                      navigate("/evidence");
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Evidence
                  </button>
                )}

                {/* Wallet Connect Mobile - Only for eligible roles */}
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <WalletConnect user={user} isCompact={true} />
                </div>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/security");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Security
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
