import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VideoSlider from '../components/VideoSlider';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  CreditCard,
  Smartphone
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  monthlyEarnings: number;
  directReferrals: number;
  totalTeamSize: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  description?: string;
}

interface MerchantAccount {
  _id: string;
  name: string;
  type: 'bank' | 'mobile_money';
  accountNumber: string;
  accountName: string;
  bankName?: string;
  phoneNumber?: string;
  instructions: string;
}

interface WithdrawalSchedule {
  startHour: number;
  endHour: number;
  isActive: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [withdrawalSchedule, setWithdrawalSchedule] = useState<WithdrawalSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, merchantResponse, scheduleResponse] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/deposits/merchant-accounts'),
        axios.get('/withdrawals/schedule')
      ]);

      setStats(statsResponse.data);
      setMerchantAccounts(merchantResponse.data.merchantAccounts);
      setWithdrawalSchedule(scheduleResponse.data.schedule);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await navigator.clipboard?.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail if clipboard not available
      }
    }
  };

  function copyTextFallback() {
    // const link = `http://www.sahamtradingplc.com/register?ref=${user.referralCode}`;
    const link = `http://localhost:3000/register?ref=${user.referralCode}`;
    let textarea;
    try {
      textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      return successful;

    } catch (err) {
      console.error('Error in copyTextFallback:', err);
      return false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  function copyText(text) {
    let textarea;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      return successful;
    } catch (err) {
      console.error('Error in copying:', err);
      return false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  const copyReferralLink = async () => {
    // const referralLink = `${window.location.origin}}/register?ref=${user?.referralCode}`;
    // const link = `http://www.sahamtradingplc.com/register?ref=${user.referralCode}`;
    const link = `http://localhost:3000/register?ref=${user.referralCode}`;

    try {
      console.log("i am here")
      // await navigator.clipboard.writeText(link.toString());
      copyTextFallback(link)
      console.log("Referral link copied to clipboard:", link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail if clipboard not available
      console.error("Failed to copy referral link");
      alert(
        "Failed to copy referral link. Please copy manually: " + referralLink
      );
      // const linkInput = document.createElement("input");
      // linkInput.value = referralLink;
      // document.body.appendChild(linkInput);
    }
  };

  // const copyAccountNumber = async (accountNumber: string) => {
  //   try {
  //     await navigator.clipboard?.writeText(accountNumber);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   } catch {
  //     // Silent fail if clipboard not available
  //   }
  // };

  const isWithdrawalTime = () => {
    if (!withdrawalSchedule) return true;
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= withdrawalSchedule.startHour && currentHour <= withdrawalSchedule.endHour;
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's an overview of your investment portfolio and earnings
          </p>
        </div>

        {/* Withdrawal Schedule Alert */}
        {withdrawalSchedule && !isWithdrawalTime() && (
          <div className="flex items-center p-4 mb-6 space-x-2 border border-yellow-200 rounded-lg bg-yellow-50">
            <Clock className="flex-shrink-0 w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Withdrawals are only available between {withdrawalSchedule.startHour}:00 and {withdrawalSchedule.endHour}:00 daily.
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalBalance || user?.balance || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-green-600">Available for withdrawal</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalDeposits || user?.totalDeposits || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Total invested amount</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalCommissions || user?.totalCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-purple-600">From referral network</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalTeamSize || user?.totalTeamSize || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">
                {stats?.directReferrals || user?.directReferrals || 0} direct referrals
              </span>
            </div>
          </div>
        </div>


        

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Referral Section */}
          <div className="lg:col-span-1">
            <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Referral Program</h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Your Referral Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <span className="font-mono text-lg font-semibold text-primary-600">
                        {showReferralCode ? user?.referralCode : '••••••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowReferralCode(!showReferralCode)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={copyReferralCode}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={copyTextFallback}
                  className="w-full px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {copied ? 'Link Copied!' : 'Copy Referral Link'}
                </button>

                <div className="p-4 rounded-lg bg-gradient-to-r from-gold-50 to-gold-100">
                  <h4 className="mb-2 font-semibold text-gold-800">Commission Structure</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 1:</span>
                      <span className="font-semibold text-gold-800">8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 2:</span>
                      <span className="font-semibold text-gold-800">4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 3:</span>
                      <span className="font-semibold text-gold-800">2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 4:</span>
                      <span className="font-semibold text-gold-800">1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Accounts */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Accounts</h3>

              <div className="space-y-4">
                {merchantAccounts.map((account) => (
                  <div key={account._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {account.type === 'bank' ? (
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-green-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{account.accountNumber}</span>
                          <button
                            onClick={() => copyText(account.accountNumber)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{account.accountName}</span>
                      </div>
                      {account.bankName && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bank:</span>
                          <span>{account.bankName}</span>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Transactions</h3>

              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentTransactions?.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-green-100' :
                          transaction.type === 'withdrawal' ? 'bg-red-100' :
                            'bg-purple-100'
                          }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownRight className={`h-4 w-4 ${transaction.type === 'deposit' ? 'text-green-600' : ''
                              }`} />
                          ) : transaction.type === 'withdrawal' ? (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          ) : (
                            <Award className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'deposit' || transaction.type === 'commission'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}>
                          {transaction.type === 'withdrawal' ? '-' : '+'}
                          {transaction.amount?.toLocaleString()} ETB
                        </p>
                        <p className={`text-xs ${transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Make your first deposit to start earning
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

