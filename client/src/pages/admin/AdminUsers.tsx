import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  X,
  TrendingUp,
  ArrowUpRight,
  Award
} from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  role: 'user' | 'admin';
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  balance: number;
  directReferrals: number;
  totalTeamSize: number;
  level: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">Manage user accounts and monitor activity</p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Deposits
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Network
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 mr-3 rounded-full bg-primary-100">
                          <Users className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                            {user.role === 'admin' && (
                              <span className="px-2 py-1 ml-2 text-xs rounded-full bg-gold-100 text-gold-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.balance.toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Commissions: {user.totalCommissions.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.totalDeposits.toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Withdrawn: {user.totalWithdrawals.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Level {user.level}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.directReferrals} direct • {user.totalTeamSize} total
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`${
                            user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{selectedUser.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedUser.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                        <p className="font-mono text-gray-900">{selectedUser.referralCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Financial Summary</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.balance.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Deposits</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.totalDeposits.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Withdrawals</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.totalWithdrawals.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Commissions</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.totalCommissions.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Network Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="font-semibold text-gray-900">Level {selectedUser.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Direct Referrals</p>
                        <p className="font-semibold text-gray-900">{selectedUser.directReferrals}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Team Size</p>
                        <p className="font-semibold text-gray-900">{selectedUser.totalTeamSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Account Status</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusToggle(selectedUser._id, selectedUser.isActive)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                        selectedUser.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 px-4 py-2 font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}