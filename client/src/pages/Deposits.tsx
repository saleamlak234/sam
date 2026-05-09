import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ImagePreviewModal from '../components/ImagePreviewModal';
import {
  Plus,
  Upload,
  CreditCard,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  DollarSign,
  Copy,
  CheckCircle2,
  Eye,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

// ========== Interfaces ==========
interface Deposit {
  _id: string;
  amount: number;
  totalAmount: number;
  package: string;
  paymentMethod: 'bank_transfer' | 'mobile_money';
  merchantAccount: {
    id: string;
    name: string;
    type: string;
    accountNumber: string;
    accountName: string;
    bankName?: string;
    phoneNumber?: string;
    instructions: string;
  };
  status: 'pending' | 'completed' | 'rejected';
  receiptUrl?: string;
  transactionReference?: string;
  isUpgraded?: boolean;
  upgradedTo?: string;
  upgradedFrom?: string;
  createdAt: string;
  updatedAt: string;
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
  isActive: boolean;
}
interface UpgradeableApiResponse {
  upgradeableDeposit: Deposit | null;
  validUpgradePackages: { name: string; price: number }[];
}

// const PACKAGES = [
//     { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
//     { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
//     { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
//     { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
//     { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
//     { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
//     { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
// ];
const PACKAGES = [
  { name: "8th Stock Package", price: 320000, dailyReturn: 11040 },
  { name: "7th Stock Package", price: 160000, dailyReturn: 5520 },
  { name: "6th Stock Package", price: 80000, dailyReturn: 2750 },
  { name: "5th Stock Package", price: 40000, dailyReturn: 1350 },
  { name: "4th Stock Package", price: 20000, dailyReturn: 670 },
  { name: "3rd Stock Package", price: 10000, dailyReturn: 330 },
  { name: "2nd Stock Package", price: 5000, dailyReturn: 162 },
  { name: "1st Stock Package", price: 2500, dailyReturn: 80 },
];

// ========== Component ==========
export default function Deposits() {
  const { user } = useAuth();

  // State
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);

  // For upgrade logic:
  const [upgradeableDeposit, setUpgradeableDeposit] = useState<Deposit | null>(null);
  const [validUpgradePackages, setValidUpgradePackages] = useState<{ name: string, price: number }[]>([]);
  const [selectedTargetPackage, setSelectedTargetPackage] = useState<{ name: string, price: number } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    amount: '',
    package: '',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'mobile_money',
    merchantAccountId: '',
    transactionReference: ''
  });
  const [upgradeFormData, setUpgradeFormData] = useState({
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'mobile_money',
    merchantAccountId: '',
    transactionReference: ''


  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [upgradeReceipt, setUpgradeReceipt] = useState<File | null>(null);
  const [upgradeReceiptPreview, setUpgradeReceiptPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [imagePreview, setImagePreview] = useState({
    isOpen: false,
    imageUrl: '',
    title: 'Receipt Preview'
  });

  // ========== Data fetch ==========
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depositsResponse, merchantAccountsResponse, upgradeableResponse] = await Promise.all([
        axios.get('/deposits'),
        axios.get('/deposits/merchant-accounts'),
        axios.get('/deposits/upgradeable')
      ]);
      setDeposits(Array.isArray(depositsResponse.data.deposits) ? depositsResponse.data.deposits : []);
      setMerchantAccounts(Array.isArray(merchantAccountsResponse.data.merchantAccounts) ? merchantAccountsResponse.data.merchantAccounts : []);
      setUpgradeableDeposit(upgradeableResponse.data.upgradeableDeposit || null);
      setValidUpgradePackages(upgradeableResponse.data.validUpgradePackages || []);
    } catch (error) {
      setError('Failed to fetch data.');
      setDeposits([]);
      setMerchantAccounts([]);
      setUpgradeableDeposit(null);
      setValidUpgradePackages([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== Form/File handlers ==========
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleUpgradeReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpgradeReceipt(file);
      const reader = new FileReader();
      reader.onload = (e) => setUpgradeReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ========== New Deposit ==========
  const handlePackageSelect = (pkg: typeof PACKAGES[number]) => {
    setFormData(prev => ({
      ...prev,
      amount: pkg.price.toString(),
      package: pkg.name
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('package', formData.package);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('merchantAccountId', formData.merchantAccountId);
      formDataToSend.append('transactionReference', formData.transactionReference);
      if (receipt) formDataToSend.append('receipt', receipt);
      await axios.post('/deposits', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowDepositForm(false);
      setFormData({
        amount: '',
        package: '',
        paymentMethod: 'bank_transfer',
        merchantAccountId: '',
        transactionReference: ''
      });
      setReceipt(null);
      setReceiptPreview('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create deposit');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== UPGRADE ==============
  const handleUpgradePackageSelect = (pkg: { name: string; price: number }) => {
    setSelectedTargetPackage(pkg);
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeableDeposit || !selectedTargetPackage) {
      setError("Select a package to upgrade.");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const upgradeAmount = selectedTargetPackage.price - upgradeableDeposit.totalAmount;
      const formDataToSend = new FormData();
      formDataToSend.append('newPackage', selectedTargetPackage.name);
      formDataToSend.append('newAmount', upgradeAmount.toString());
      formDataToSend.append('paymentMethod', upgradeFormData.paymentMethod);
      formDataToSend.append('merchantAccountId', upgradeFormData.merchantAccountId);
      formDataToSend.append('transactionReference', upgradeFormData.transactionReference);
      if (upgradeReceipt) formDataToSend.append('receipt', upgradeReceipt);

      await axios.post(`/deposits/upgrade/${upgradeableDeposit._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowUpgradeForm(false);
      setSelectedTargetPackage(null);
      setUpgradeFormData({
        paymentMethod: 'bank_transfer',
        merchantAccountId: '',
        transactionReference: ''
      });
      setUpgradeReceipt(null);
      setUpgradeReceiptPreview('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit upgrade request');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== Utilities ==========
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) { }
  };
  const viewReceipt = (receiptUrl: string) => {
    setImagePreview({
      isOpen: true,
      // imageUrl: receiptUrl.startsWith('http') ? receiptUrl : `http://31.97.125.62:5000${receiptUrl}`,
      imageUrl: receiptUrl.startsWith('http') ? receiptUrl : `http://localhost:5000${receiptUrl}`,
      title: 'Payment Receipt'
    });
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };
  const selectedMerchantAccount = merchantAccounts.find(acc => acc._id === formData.merchantAccountId);
  const selectedUpgradeMerchantAccount = merchantAccounts.find(acc => acc._id === upgradeFormData.merchantAccountId);

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
        {/* ---------- Header ------------- */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deposits</h1>
            <p className="mt-1 text-gray-600">
              Manage your investment deposits
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDepositForm(true)}
              className="flex items-center px-6 py-3 space-x-2 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              disabled={deposits.length > 0}
              title={
                deposits.length > 0
                  ? "You already have a deposit. Please upgrade instead."
                  : ""
              }
            >
              <Plus className="w-5 h-5" />
              <span>New Deposit</span>
            </button>
            {upgradeableDeposit && (
              <button
                onClick={() => setShowUpgradeForm(true)}
                className="flex items-center px-6 py-3 space-x-2 font-medium text-white rounded-lg bg-gold-600 hover:bg-gold-700"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Upgrade Package</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------- Image Preview Modal ---------- */}
        <ImagePreviewModal
          isOpen={imagePreview.isOpen}
          onClose={() => setImagePreview({ ...imagePreview, isOpen: false })}
          imageUrl={imagePreview.imageUrl}
          title={imagePreview.title}
          allowDownload
        />

        {/* ---------- Deposit Modal ---------- */}
        {showDepositForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Make a Deposit
                </h2>
                {error && (
                  <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}
                {/* ------ Package Selection ------ */}
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Choose Package
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {PACKAGES.map((pkg, index) => (
                      <div
                        key={index}
                        onClick={() => handlePackageSelect(pkg)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.package === pkg.name
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <h4 className="font-semibold text-gray-900">
                          {pkg.name}
                        </h4>
                        <p className="mt-1 text-2xl font-bold text-primary-600">
                          {pkg.price.toLocaleString()} ETB
                        </p>
                        <p className="text-sm text-gray-600">
                          Daily Return: {pkg.dailyReturn.toLocaleString()} ETB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Amount (ETB)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter amount"
                          required
                          min="2500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: "bank_transfer",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === "bank_transfer"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">Bank Transfer</span>
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: "mobile_money",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === "mobile_money"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">Mobile Money</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Merchant Account Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Payment Account
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {merchantAccounts
                        .filter(
                          (acc) =>
                            (formData.paymentMethod === "bank_transfer" &&
                              acc.type === "bank") ||
                            (formData.paymentMethod === "mobile_money" &&
                              acc.type === "mobile_money")
                        )
                        .map((account) => (
                          <div
                            key={account._id}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                merchantAccountId: account._id,
                              }))
                            }
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.merchantAccountId === account._id
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <h4 className="font-semibold text-gray-900">
                              {account.name}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Account:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm">
                                    {account.accountNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(account.accountNumber);
                                    }}
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    {copiedText === account.accountNumber ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Name:
                                </span>
                                <span className="text-sm">
                                  {account.accountName}
                                </span>
                              </div>
                              {account.bankName && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Bank:
                                  </span>
                                  <span className="text-sm">
                                    {account.bankName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  {/* Payment Instructions */}
                  {selectedMerchantAccount && (
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="mb-2 font-semibold text-blue-900">
                        Payment Instructions
                      </h4>
                      <p className="text-sm text-blue-800">
                        {selectedMerchantAccount.instructions}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Transaction Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.transactionReference}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          transactionReference: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter transaction reference or ID"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Payment Receipt (Optional)
                    </label>
                    <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        onChange={handleReceiptChange}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer"
                      >
                        {receiptPreview ? (
                          <div className="space-y-4">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="object-contain h-32 max-w-full mx-auto rounded"
                            />
                            <p className="font-medium text-green-600">
                              {receipt?.name}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">
                              Click to upload payment receipt
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              PNG, JPG up to 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowDepositForm(false)}
                      className="flex-1 px-4 py-3 font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formData.merchantAccountId ||
                        !formData.transactionReference ||
                        !receipt}
                      className="flex items-center justify-center flex-1 px-4 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      ) : (
                        "Submit Deposit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========== Deposits List ========== */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Deposit History
            </h2>
          </div>
          {deposits.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <div key={deposit._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(deposit.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {deposit.package}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(deposit.createdAt).toLocaleDateString()} •{" "}
                          {deposit.merchantAccount?.name}
                        </p>
                        {deposit.transactionReference && (
                          <p className="text-xs text-gray-500">
                            Ref: {deposit.transactionReference}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {deposit.amount.toLocaleString()} ETB
                      </p>
                      {deposit.isUpgraded && (
                        <p className="text-xs font-medium text-blue-600">
                          ✓ Upgraded
                        </p>
                      )}
                      {deposit.upgradedFrom && (
                        <p className="text-xs font-medium text-green-600">
                          ↗ Package upgrade
                        </p>
                      )}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          deposit.status
                        )}`}
                      >
                        {deposit.status.charAt(0).toUpperCase() +
                          deposit.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {deposit.receiptUrl && (
                    <div className="mt-4">
                      <button
                        onClick={() => viewReceipt(deposit.receiptUrl!)}
                        className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No deposits yet
              </h3>
              <p className="mb-6 text-gray-600">
                Start your investment journey by making your first deposit
              </p>

              <button
                onClick={() => setShowDepositForm(true)}

                className="px-6 py-3 font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Make First Deposit
              </button>
            </div>
          )}
        </div>

        {/* ========== Upgrade Modal ========== */}
        {showUpgradeForm && upgradeableDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Upgrade Your Package
                </h2>
                {error && (
                  <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}
                <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Current Package:
                      </h4>
                      <p className="text-blue-800">
                        {upgradeableDeposit.package}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-900">
                        {upgradeableDeposit.amount.toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Choose Upgrade Package
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {validUpgradePackages.map((pkg, index) => {
                      const upgradeAmount =
                        pkg.price - upgradeableDeposit.totalAmount;
                      return (
                        <div
                          key={index}
                          onClick={() => handleUpgradePackageSelect(pkg)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTargetPackage &&
                            selectedTargetPackage.name === pkg.name
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <h4 className="font-semibold text-gray-900">
                            {pkg.name}
                          </h4>
                          <p className="mt-1 text-2xl font-bold text-primary-600">
                            {pkg.price.toLocaleString()} ETB
                          </p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-gray-600">
                              Upgrade cost:{" "}
                              <span className="font-semibold text-orange-600">
                                {upgradeAmount.toLocaleString()} ETB
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <form onSubmit={handleUpgradeSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Upgrade Amount (ETB)
                      </label>
                      <input
                        type="number"
                        value={
                          selectedTargetPackage
                            ? selectedTargetPackage.price -
                            upgradeableDeposit.totalAmount
                            : ""
                        }
                        readOnly
                        className="w-full py-3 pl-10 pr-3 bg-gray-100 border border-gray-300 rounded-lg"
                        placeholder="Select package to see upgrade cost"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() =>
                            setUpgradeFormData((prev) => ({
                              ...prev,
                              paymentMethod: "bank_transfer",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${upgradeFormData.paymentMethod === "bank_transfer"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">Bank Transfer</span>
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setUpgradeFormData((prev) => ({
                              ...prev,
                              paymentMethod: "mobile_money",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${upgradeFormData.paymentMethod === "mobile_money"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">Mobile Money</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Payment Account
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {merchantAccounts
                        .filter(
                          (acc) =>
                            (upgradeFormData.paymentMethod ===
                              "bank_transfer" &&
                              acc.type === "bank") ||
                            (upgradeFormData.paymentMethod ===
                              "mobile_money" &&
                              acc.type === "mobile_money")
                        )
                        .map((account) => (
                          <div
                            key={account._id}
                            onClick={() =>
                              setUpgradeFormData((prev) => ({
                                ...prev,
                                merchantAccountId: account._id,
                              }))
                            }
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${upgradeFormData.merchantAccountId ===
                              account._id
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <h4 className="font-semibold text-gray-900">
                              {account.name}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Account:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm">
                                    {account.accountNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(account.accountNumber);
                                    }}
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    {copiedText === account.accountNumber ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Name:
                                </span>
                                <span className="text-sm">
                                  {account.accountName}
                                </span>
                              </div>
                              {account.bankName && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Bank:
                                  </span>
                                  <span className="text-sm">
                                    {account.bankName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  {selectedUpgradeMerchantAccount && (
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="mb-2 font-semibold text-blue-900">
                        Payment Instructions
                      </h4>
                      <p className="text-sm text-blue-800">
                        {selectedUpgradeMerchantAccount.instructions}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Transaction Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={upgradeFormData.transactionReference}
                      onChange={(e) =>
                        setUpgradeFormData((prev) => ({
                          ...prev,
                          transactionReference: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter transaction reference or ID"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Payment Receipt (Optional)
                    </label>
                    <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        onChange={handleUpgradeReceiptChange}
                        className="hidden"
                        id="upgrade-receipt-upload"
                      />
                      <label
                        htmlFor="upgrade-receipt-upload"
                        className="cursor-pointer"
                      >
                        {upgradeReceiptPreview ? (
                          <div className="space-y-4">
                            <img
                              src={upgradeReceiptPreview}
                              alt="Receipt preview"
                              className="object-contain h-32 max-w-full mx-auto rounded"
                            />
                            <p className="font-medium text-green-600">
                              {upgradeReceipt?.name}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">
                              Click to upload payment receipt
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              PNG, JPG up to 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpgradeForm(false);
                        setSelectedTargetPackage(null);
                      }}
                      className="flex-1 px-4 py-3 font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !selectedTargetPackage ||
                        !upgradeFormData.merchantAccountId
                        // ||
                        // !upgradeFormData.transactionReference ||
                        // !upgradeReceipt
                      }
                      className="flex items-center justify-center flex-1 px-4 py-3 font-medium text-white rounded-lg bg-gold-600 hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      ) : (
                        "Submit Upgrade"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



