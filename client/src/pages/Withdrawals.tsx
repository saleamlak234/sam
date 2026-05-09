import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Smartphone,
  AlertCircle,
  Calculator,
  Package,
  Star,
  Crown,
  Award,
  Zap,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import axios from 'axios';

interface Withdrawal {
  id: string;
  amount: number;
  packageId: string;
  packageLabel: string;
  vatAmount: number;
  netAmount: number;
  paymentMethod: 'bank' | 'telebirr';
  accountDetails: {
    accountNumber?: string;
    bankName?: string;
    phoneNumber?: string;
  };
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

const WITHDRAWAL_PACKAGES = [
  {
    id: 'basic',
    amount: 200,
    label: 'Basic Package',
    icon: Package,
    color: 'from-gray-500 to-gray-700',
    description: 'Entry level withdrawal'
  },
  {
    id: 'starter',
    amount: 700,
    label: 'Starter Package',
    icon: Star,
    color: 'from-blue-500 to-blue-700',
    description: 'Small withdrawal amount'
  },
  {
    id: 'standard',
    amount: 2000,
    label: 'Standard Package',
    icon: Target,
    color: 'from-green-500 to-green-700',
    description: 'Regular withdrawal'
  },
  {
    id: 'premium',
    amount: 7000,
    label: 'Premium Package',
    icon: Award,
    color: 'from-purple-500 to-purple-700',
    description: 'Higher withdrawal amount'
  },
  {
    id: 'advanced',
    amount: 20000,
    label: 'Advanced Package',
    icon: Zap,
    color: 'from-orange-500 to-orange-700',
    description: 'Advanced level withdrawal'
  },
  {
    id: 'professional',
    amount: 70000,
    label: 'Professional Package',
    icon: TrendingUp,
    color: 'from-red-500 to-red-700',
    description: 'Professional withdrawal'
  },
  {
    id: 'enterprise',
    amount: 200000,
    label: 'Enterprise Package',
    icon: Shield,
    color: 'from-indigo-500 to-indigo-700',
    description: 'Large withdrawal amount'
  },
  {
    id: 'elite',
    amount: 700000,
    label: 'Elite Package',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-700',
    description: 'Maximum withdrawal package'
  }
];

export default function Withdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [formData, setFormData] = useState({
    paymentMethod: 'bank' as 'bank' | 'telebirr',
    accountNumber: '',
    bankName: '',
    phoneNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
  const [notAllowedReason, setNotAllowedReason] = useState<string | null>(null);

  const VAT_RATE = 0.15; // 15% VAT

  useEffect(() => {
    fetchWithdrawals();
    checkWithdrawalSchedule();
    // Optionally, set interval to update isAllowed every minute
    const interval = setInterval(checkWithdrawalSchedule, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get('/withdrawals');
      setWithdrawals(response.data.withdrawals);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWithdrawalSchedule = async () => {
    try {
      // Get Nairobi time
      const now = new Date();
      const nairobiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      const currentHour = nairobiTime.getHours();
      const dayOfWeek = nairobiTime.getDay(); // 0 = Sunday

      // if (dayOfWeek === 0) {
      //   setIsAllowed(false);
      //   setNotAllowedReason('Withdrawals are not allowed on Sundays.');
      //   return;
      // }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setIsAllowed(false);
        setNotAllowedReason('Withdrawals are not allowed on Saturday and Sunday.');
        return;
      }

      if (currentHour < 10 || currentHour >= 17) {
        setIsAllowed(false);
        setNotAllowedReason('Withdrawals are only allowed between 10:00 AM and 5:00 PM Nairobi time.');
        return;
      }

      setIsAllowed(true);
      setNotAllowedReason(null);
    } catch (error) {
      console.error('Error fetching withdrawal schedule:', error);
      setIsAllowed(false);
      setNotAllowedReason('Unable to determine withdrawal window.');
    }
  };

  const calculateAmounts = (grossAmount: number) => {
    const vatAmount = grossAmount * VAT_RATE;
    const netAmount = grossAmount - vatAmount;
    return { vatAmount, netAmount };
  };

  const getSelectedPackageData = () => {
    return WITHDRAWAL_PACKAGES.find(pkg => pkg.id === selectedPackage);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!selectedPackage) {
      setError('Please select a withdrawal package');
      setSubmitting(false);
      return;
    }

    const packageData = getSelectedPackageData();
    if (!packageData) {
      setError('Invalid package selected');
      setSubmitting(false);
      return;
    }

    if (packageData.amount > (user?.balance || 0)) {
      setError('Insufficient balance for this package');
      setSubmitting(false);
      return;
    }

    try {
      const withdrawalData = {
        packageId: selectedPackage,
        amount: packageData.amount,
        paymentMethod: formData.paymentMethod,
        accountDetails: formData.paymentMethod === 'bank'
          ? {
            accountNumber: formData.accountNumber,
            bankName: formData.bankName
          }
          : {
            phoneNumber: formData.phoneNumber
          }
      };

      await axios.post('/withdrawals', withdrawalData);

      setShowWithdrawForm(false);
      setSelectedPackage('');
      setFormData({
        paymentMethod: 'bank',
        accountNumber: '',
        bankName: '',
        phoneNumber: ''
      });
      fetchWithdrawals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawals</h1>
            <p className="mt-1 text-gray-600">
              Withdraw using predefined packages (10:00 AM - 5:00 PM Nairobi time, <span className="font-semibold text-red-600">No Sundays</span>)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {(user?.balance || 0).toLocaleString()} ETB
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawForm(true)}
              disabled={(user?.balance || 0) < 200 || !isAllowed}
              className="flex items-center px-6 py-3 space-x-2 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Balance Warning */}
        {(user?.balance || 0) < 200 && (
          <div className="flex items-center p-4 mb-6 space-x-2 border border-yellow-200 rounded-lg bg-yellow-50">
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Minimum withdrawal package is 200 ETB. Your current balance is {(user?.balance || 0).toLocaleString()} ETB.
            </span>
          </div>
        )}

        {/* Time Window Warning */}
        {!isAllowed && notAllowedReason && (
          <div className="flex items-center p-4 mb-6 space-x-2 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
            <span className="text-red-800">{notAllowedReason}</span>
          </div>
        )}

        {/* Package Information */}
        <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center mb-2 space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Withdrawal Package System</h3>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• You can only withdraw using predefined package amounts</p>
            <p>• 15% VAT will be deducted from your withdrawal amount</p>
            <p>• You can only make one withdrawal per day</p>
            <p>• Withdrawals are only available between <b>10:00 AM - 5:00 PM Nairobi time</b> (No Sundays)</p>
          </div>
        </div>

        {/* Withdrawal Form Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Select Withdrawal Package</h2>

                {error && (
                  <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                {/* Package Selection */}
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Choose Package Amount</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {WITHDRAWAL_PACKAGES.map((pkg) => {
                      const IconComponent = pkg.icon;
                      const { vatAmount, netAmount } = calculateAmounts(pkg.amount);
                      const isAvailable = pkg.amount <= (user?.balance || 0);
                      const isSelected = selectedPackage === pkg.id;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => isAvailable && handlePackageSelect(pkg.id)}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : isAvailable
                              ? 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2">
                              <div className="p-1 text-white rounded-full bg-primary-500">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            </div>
                          )}

                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${pkg.color} mb-3`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>

                            <h4 className="mb-1 font-semibold text-gray-900">{pkg.label}</h4>
                            <p className="mb-1 text-2xl font-bold text-primary-600">
                              {pkg.amount.toLocaleString()} ETB
                            </p>
                            <p className="mb-3 text-xs text-gray-600">{pkg.description}</p>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gross:</span>
                                <span className="font-medium">{pkg.amount.toLocaleString()} ETB</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>VAT (15%):</span>
                                <span className="font-medium">-{vatAmount.toLocaleString()} ETB</span>
                              </div>
                              <div className="flex justify-between pt-1 font-bold text-green-600 border-t">
                                <span>Net:</span>
                                <span>{netAmount.toLocaleString()} ETB</span>
                              </div>
                            </div>

                            {!isAvailable && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-red-600">Insufficient Balance</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'bank'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-center">
                          <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                          <p className="font-medium text-gray-900">Bank Transfer</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'telebirr' }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'telebirr'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-center">
                          <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                          <p className="font-medium text-gray-900">TeleBirr</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod === 'bank' ? (
                    <>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Commercial Bank of Ethiopia"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter your account number"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        TeleBirr Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+251 9XX XXX XXX"
                        required
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowWithdrawForm(false)}
                      className="flex-1 px-4 py-3 font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !selectedPackage || !isAllowed}
                      className="flex items-center justify-center flex-1 px-4 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      ) : (
                        'Request Withdrawal'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals List */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Withdrawal History</h2>
          </div>

          {withdrawals.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {withdrawal.packageLabel}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(withdrawal.createdAt).toLocaleDateString()} •
                          {withdrawal.paymentMethod === 'bank' ? 'Bank Transfer' : 'TeleBirr'}
                        </p>
                        {withdrawal.paymentMethod === 'bank' ? (
                          <p className="text-sm text-gray-500">
                            {withdrawal.accountDetails.bankName} • {withdrawal.accountDetails.accountNumber}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {withdrawal.accountDetails.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900">
                          {withdrawal.netAmount.toLocaleString()} ETB
                        </p>
                        <p className="text-xs text-gray-500">
                          Gross: {withdrawal.amount.toLocaleString()} ETB
                        </p>
                        <p className="text-xs text-red-500">
                          VAT: -{withdrawal.vatAmount.toLocaleString()} ETB
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                    <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {withdrawal.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ArrowUpRight className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No withdrawals yet</h3>
              <p className="mb-6 text-gray-600">
                Your withdrawal requests will appear here
              </p>
              {(user?.balance || 0) >= 200 && (
                <button
                  onClick={() => setShowWithdrawForm(true)}
                  className="px-6 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  disabled={!isAllowed}
                >
                  Request Withdrawal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
