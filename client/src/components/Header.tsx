
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';
import axios from 'axios';
import {
  TrendingUp,
  User,
  Menu,
  X,
  LogOut,
  DollarSign,
  Users,
  Award,
  BarChart3,
  Shield,
  Crown,
  Trophy,
  Zap,
  CheckCircle,
  Video
} from 'lucide-react';
import PackageSlider from './PackageSlider';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [videoRewards, setVideoRewards] = useState(0);

  useEffect(() => {
    if (user) {
      fetchVideoRewards();
    }
  }, [user]);

  const fetchVideoRewards = async () => {
    try {
      const response = await axios.get('/videos/rewards/today');
      setVideoRewards(response.data.todayRewards || 0);
    } catch (error) {
      console.error('Error fetching video rewards:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getVipBadgeIcon = (vipBadge: string) => {
    switch (vipBadge) {
      case 'bronze': return <Award className="w-4 h-4 text-orange-600" />;
      case 'silver': return <Award className="w-4 h-4 text-gray-500" />;
      case 'gold': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'platinum': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'diamond': return <Trophy className="w-4 h-4 text-blue-600" />;
      case 'master': return <Zap className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      {/* Package Slider */}
      <PackageSlider />

      {/* Main Header */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">{env.APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            <Link to="/" className="text-gray-700 transition-colors hover:text-primary-600">
              Home
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 transition-colors hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/deposits" className="text-gray-700 transition-colors hover:text-primary-600">
                  Deposits
                </Link>
                <Link to="/withdrawals" className="text-gray-700 transition-colors hover:text-primary-600">
                  Withdrawals
                </Link>
                <Link to="/commissions" className="text-gray-700 transition-colors hover:text-primary-600">
                  Commissions
                </Link>
                <Link to="/videos" className="flex items-center space-x-1 text-gray-700 transition-colors hover:text-primary-600">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </Link>
                <Link to="/mlm-tree" className="text-gray-700 transition-colors hover:text-primary-600">
                  MLM Tree
                </Link>
                <Link to="/referral-approvals" className="text-gray-700 transition-colors hover:text-primary-600">
                  Approvals
                </Link>
                <Link to="/vip-levels" className="flex items-center space-x-1 font-medium transition-colors text-gold-600 hover:text-gold-700">
                  <Crown className="w-4 h-4" />
                  <span>VIP Levels</span>
                </Link>
                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                  <Link to="/admin" className="font-medium text-red-600 transition-colors hover:text-red-700">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="items-center hidden space-x-4 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 transition-colors hover:text-primary-600"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.fullName}</span>
                  {user.vipBadge && user.vipBadge !== 'none' && (
                    <div className="flex items-center space-x-1">
                      {getVipBadgeIcon(user.vipBadge)}
                      <span className="text-xs font-bold text-gold-600">VIP {user.vipLevel}</span>
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-80">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {user.vipBadge && user.vipBadge !== 'none' && (
                          <div className="flex items-center px-2 py-1 space-x-1 rounded-full bg-gold-100">
                            {getVipBadgeIcon(user.vipBadge)}
                            <span className="text-xs font-bold text-gold-800">
                              VIP {user.vipLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Balance:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {user.balance.toLocaleString()} ETB
                        </span>
                      </div>
                      {videoRewards > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Video Rewards:</span>
                          <span className="text-sm font-semibold text-blue-600">
                            +{videoRewards.toLocaleString()} ETB
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/vip-levels"
                        className="flex items-center px-4 py-2 text-sm text-gold-600 hover:bg-gold-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Crown className="w-4 h-4 mr-3" />
                        VIP Levels
                      </Link>
                      <Link
                        to="/deposits"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <DollarSign className="w-4 h-4 mr-3" />
                        Deposits
                      </Link>
                      <Link
                        to="/commissions"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Award className="w-4 h-4 mr-3" />
                        Commissions
                      </Link>
                      <Link
                        to="/referral-approvals"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CheckCircle className="w-4 h-4 mr-3" />
                        Approvals
                      </Link>
                      {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 transition-colors hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 rounded-md md:hidden hover:text-primary-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="py-4 border-t border-gray-200 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/vip-levels"
                    className="font-medium transition-colors text-gold-600 hover:text-gold-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    VIP Levels
                  </Link>
                  <Link
                    to="/deposits"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deposits
                  </Link>
                  <Link
                    to="/withdrawals"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Withdrawals
                  </Link>
                  <Link
                    to="/commissions"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Commissions
                  </Link>
                  <Link
                    to="/videos"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Video className="inline w-4 h-4 mr-2" />
                    Videos
                  </Link>
                  <Link
                    to="/referral-approvals"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Approvals
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                    <Link
                      to="/admin"
                      className="font-medium text-red-600 transition-colors hover:text-red-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}