import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import axios from 'axios';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalCommissions: number;
  monthlyRevenue: number;
  recentTransactions: Transaction[];
  recentUsers: User[];
  daily: {
    revenue: number;
    totalDeposit: number;
    totalWithdrawal: number;
  };
  weekly: {
    revenue: number;
    totalDeposit: number;
    totalWithdrawal: number;
  };
  monthly: {
    revenue: number;
    totalDeposit: number;
    totalWithdrawal: number;
  };
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  user: {
    fullName: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  totalDeposits: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ totalDeposit: number; totalWithdrawal: number; revenue: number } | null>(null);
  const [summaryPeriod, setSummaryPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (period: string) => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await axios.get(`/admin/transaction-summary?period=${period}`);
      setSummary(res.data);
    } catch (e) {
      setSummaryError("Failed to fetch summary");
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(summaryPeriod);
  }, [summaryPeriod]);

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      fetchAdminStats(); // Refresh data
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      {/* Transaction Summary Widget */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Transaction Summary:</span>
          <select
            value={summaryPeriod}
            onChange={e => setSummaryPeriod(e.target.value as any)}
            className="px-2 py-1 border rounded"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        {summaryLoading ? (
          <div>Loading...</div>
        ) : summaryError ? (
          <div className="text-red-600">{summaryError}</div>
        ) : summary ? (
          <div className="flex mt-2 space-x-8">
            <div>Total Deposit: <span className="font-bold">{summary.totalDeposit.toLocaleString()} ETB</span></div>
            <div>Total Withdrawal: <span className="font-bold">{summary.totalWithdrawal.toLocaleString()} ETB</span></div>
            <div>Revenue: <span className="font-bold">{summary.revenue.toLocaleString()} ETB</span></div>
          </div>
        ) : null}
      </div>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage platform operations and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600">
                {stats?.activeUsers || 0} active users
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalDeposits || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowDownRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600">
                {stats?.pendingDeposits || 0} pending
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalWithdrawals || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600">
                {stats?.pendingWithdrawals || 0} pending
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.monthlyRevenue || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-purple-600">This month</span>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <p className="text-sm text-gray-600">Daily Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.daily?.revenue || 0).toLocaleString()} ETB
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Deposits: {(stats?.daily?.totalDeposit || 0).toLocaleString()} ETB<br />
              Withdrawals: {(stats?.daily?.totalWithdrawal || 0).toLocaleString()} ETB
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <p className="text-sm text-gray-600">Weekly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.weekly?.revenue || 0).toLocaleString()} ETB
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Deposits: {(stats?.weekly?.totalDeposit || 0).toLocaleString()} ETB<br />
              Withdrawals: {(stats?.weekly?.totalWithdrawal || 0).toLocaleString()} ETB
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.monthly?.revenue || 0).toLocaleString()} ETB
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Deposits: {(stats?.monthly?.totalDeposit || 0).toLocaleString()} ETB<br />
              Withdrawals: {(stats?.monthly?.totalWithdrawal || 0).toLocaleString()} ETB
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <Link
            to="/admin/users"
            className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/transactions"
            className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transactions</h3>
                <p className="text-sm text-gray-600">Review deposits and withdrawals</p>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Platform Health</h3>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Transactions */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <Link
                  to="/admin/transactions"
                  className="flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.user?.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.amount.toLocaleString()} ETB
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {user.totalDeposits.toLocaleString()} ETB
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4 text-red-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-8 space-y-4">
          {(stats?.pendingDeposits || 0) > 0 && (
            <div className="flex items-center p-4 space-x-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {stats?.pendingDeposits} pending deposits require review
                </p>
                <Link
                  to="/admin/transactions"
                  className="text-sm text-yellow-700 underline hover:text-yellow-800"
                >
                  Review now
                </Link>
              </div>
            </div>
          )}

          {(stats?.pendingWithdrawals || 0) > 0 && (
            <div className="flex items-center p-4 space-x-3 border border-orange-200 rounded-lg bg-orange-50">
              <Clock className="flex-shrink-0 w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {stats?.pendingWithdrawals} withdrawal requests awaiting approval
                </p>
                <Link
                  to="/admin/transactions"
                  className="text-sm text-orange-700 underline hover:text-orange-800"
                >
                  Process now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}