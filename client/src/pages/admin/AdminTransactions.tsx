import React, { useState, useEffect } from 'react';
import ImagePreviewModal from '../../components/ImagePreviewModal';

import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Calendar,
  X,
  Calculator
} from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  vatAmount?: number;
  netAmount?: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  receiptUrl?: string;
  accountDetails?: any;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [imagePreview, setImagePreview] = useState({
    isOpen: false,
    imageUrl: '',
    title: 'Receipt Preview'
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/admin/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    setActionLoading(true);
    try {
      await axios.put(`/admin/transactions/${transactionId}`, {
        action,
        rejectionReason
      });

      setTransactions(transactions.map(transaction =>
        transaction.id === transactionId
          ? {
            ...transaction,
            status: action === 'approve' ? 'completed' : 'rejected',
            rejectionReason: action === 'reject' ? rejectionReason : undefined
          }
          : transaction
      ));

      setShowTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    } finally {
      setActionLoading(false);
    }
  };
  const viewReceipt = (receiptUrl: string) => {
    const baseURL =
      // "http://31.97.125.62:5000"; // Adjust base URL as needed
      "http://localhost:5000"; // Adjust base URL as needed
    const fullReceiptUrl = `${baseURL}${receiptUrl}`;;
    setImagePreview({
      isOpen: true,
      imageUrl: fullReceiptUrl,
      title: 'Payment Receipt'
    });
  };

  // const downloadFile = async (url) => {
  //   const originalRelativeUrl = url;

  //   const imageUrl = 'http://31.97.125.62:5000' + originalRelativeUrl;

  //   const fileName = originalRelativeUrl.substring(originalRelativeUrl.lastIndexOf('/') + 1);

  //   try {
  //     const response = await fetch(imageUrl);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const blob = await response.blob();

  //     const blobUrl = window.URL.createObjectURL(blob);

  //     const link = document.createElement('a');
  //     link.href = blobUrl;

  //     link.setAttribute('download', fileName);

  //     document.body.appendChild(link);

  //     link.click();

  //     link.parentNode?.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);

  //   } catch (err) {
  //     console.error('Download error:', err);
  //     alert(`Failed to download image: ${err.message}`);
  //   }
  // }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      (transaction.user &&
        transaction.user.fullName &&
        transaction.user.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (transaction.user &&
        transaction.user.email &&
        transaction.user.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="mt-1 text-gray-600">Review and manage deposits and withdrawals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="text-sm text-gray-600">
                {filteredTransactions.length} of {transactions.length} transactions
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.amount.toLocaleString()} ETB
                        </div>
                        {transaction.type === 'withdrawal' && transaction.vatAmount && (
                          <div className="text-xs text-gray-500">
                            VAT: {transaction.vatAmount.toLocaleString()} ETB
                            <br />
                            Net: {transaction.netAmount?.toLocaleString()} ETB
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowTransactionModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.receiptUrl && (
                          <button
                            onClick={() => viewReceipt(transaction.receiptUrl!)}
                            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Image Preview Modal */}
        <ImagePreviewModal
          isOpen={imagePreview.isOpen}
          onClose={() => setImagePreview(prev => ({ ...prev, isOpen: false }))}
          imageUrl={imagePreview.imageUrl}
          title={imagePreview.title}
          allowDownload={true}
        />

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Transaction Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Transaction Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="text-gray-900 capitalize">{selectedTransaction.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gross Amount</label>
                        <p className="font-semibold text-gray-900">
                          {selectedTransaction.amount.toLocaleString()} ETB
                        </p>
                      </div>
                      {selectedTransaction.type === 'withdrawal' && selectedTransaction.vatAmount && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">VAT (15%)</label>
                            <p className="font-semibold text-red-600">
                              {selectedTransaction.vatAmount.toLocaleString()} ETB
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                            <p className="font-semibold text-green-600">
                              {selectedTransaction.netAmount?.toLocaleString()} ETB
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <p className="text-gray-900">{selectedTransaction.paymentMethod}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                          {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="text-gray-900">
                          {new Date(selectedTransaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Updated</label>
                        <p className="text-gray-900">
                          {new Date(selectedTransaction.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">User Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedTransaction.user.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedTransaction.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details for Withdrawals */}
                  {selectedTransaction.type === 'withdrawal' && selectedTransaction.accountDetails && (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h3 className="mb-3 font-semibold text-gray-900">Account Details</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {selectedTransaction.accountDetails.bankName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <p className="text-gray-900">{selectedTransaction.accountDetails.bankName}</p>
                          </div>
                        )}
                        {selectedTransaction.accountDetails.accountNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <p className="text-gray-900">{selectedTransaction.accountDetails.accountNumber}</p>
                          </div>
                        )}
                        {selectedTransaction.accountDetails.phoneNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <p className="text-gray-900">{selectedTransaction.accountDetails.phoneNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Receipt */}
                  {selectedTransaction.receiptUrl && (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h3 className="mb-3 font-semibold text-gray-900">Receipt</h3>
                      <button
                        onClick={() => viewReceipt(selectedTransaction.receiptUrl!)}
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedTransaction.status === 'rejected' && selectedTransaction.rejectionReason && (
                    <div className="p-4 rounded-lg bg-red-50">
                      <h3 className="mb-3 font-semibold text-red-900">Rejection Reason</h3>
                      <p className="text-red-800">{selectedTransaction.rejectionReason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedTransaction.status === 'pending' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleTransactionAction(selectedTransaction.id, 'approve')}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            handleTransactionAction(selectedTransaction.id, 'reject', reason);
                          }
                        }}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
