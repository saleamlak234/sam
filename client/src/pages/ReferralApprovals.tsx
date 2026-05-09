import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FilePreviewModal from '../components/ImagePreviewModal';
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  CreditCard,
  Smartphone,
  DollarSign,
  User,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface ReferralDeposit {
  _id: string;
  amount: number;
  package: string;
  paymentMethod: 'bank_transfer' | 'mobile_money';
  merchantAccount: {
    _id: string;
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
  user: {
    _id: string;
    fullName: string;
    level: number;
  };
  createdAt: string;
}

export default function ReferralApprovals() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<ReferralDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchReferralDeposits();
  }, []);

  const fetchReferralDeposits = async () => {
    try {
      const response = await axios.get('/user/referral-deposits');
      setDeposits(response.data.deposits);
    } catch (error) {
      console.error('Error fetching referral deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (depositId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    setProcessing(depositId);
    try {
      await axios.post(`/user/referral-deposits/${depositId}`, {
        action,
        rejectionReason
      });
      // Refresh the list
      await fetchReferralDeposits();
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert('Error processing deposit');
    } finally {
      setProcessing(null);
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const viewReceipt = (receiptUrl: string) => {
    const baseURL = "http://localhost:5000"; // Adjust base URL as needed
    const fullReceiptUrl = `${baseURL}${receiptUrl}`;
    setSelectedImage(fullReceiptUrl);
    setShowImageModal(true);
  };

  const downloadFile = async (url: string) => {
    const baseURL = "http://localhost:5000"; // Adjust base URL as needed
    const imageUrl = baseURL + url;
    const fileName = url.substring(url.lastIndexOf('/') + 1);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert(`Failed to download image: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Referral Deposit Approvals</h1>
        <p className="mt-2 text-gray-600">Review and approve initial deposits from your direct referrals</p>
      </div>

      {deposits.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending deposits</h3>
          <p className="mt-1 text-sm text-gray-500">There are no initial deposits waiting for your approval.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {deposits.map((deposit) => (
            <div key={deposit._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{deposit.user.fullName}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Level {deposit.user.level}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Package:</span> {deposit.package}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> {deposit.amount.toLocaleString()} ETB
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span> {deposit.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Mobile Money'}
                    </div>
                    <div>
                      <span className="font-medium">Reference:</span> {deposit.transactionReference || 'N/A'}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Merchant:</span> {deposit.merchantAccount.name}
                    <div className="text-sm text-gray-600 mt-1">
                      {deposit.merchantAccount.type === 'bank' ? (
                        <>
                          <div>Account: {deposit.merchantAccount.accountNumber}</div>
                          <div>Name: {deposit.merchantAccount.accountName}</div>
                          <div>Bank: {deposit.merchantAccount.bankName}</div>
                        </>
                      ) : (
                        <>
                          <div>Phone: {deposit.merchantAccount.phoneNumber}</div>
                          <div>Name: {deposit.merchantAccount.accountName}</div>
                        </>
                      )}
                    </div>
                  </div>
                  {deposit.receiptUrl && (
                    <div className="mt-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewReceipt(deposit.receiptUrl!)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Receipt
                        </button>
                        <button
                          onClick={() => downloadFile(deposit.receiptUrl!)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval(deposit._id, 'approve')}
                    disabled={processing === deposit._id}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === deposit._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) handleApproval(deposit._id, 'reject', reason);
                    }}
                    disabled={processing === deposit._id}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FilePreviewModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        fileUrl={selectedImage}
        title="Payment Receipt"
        allowDownload={true}
      />
    </div>
  );
}