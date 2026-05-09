import React from 'react';
import { X, Download, Eye } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
  allowDownload?: boolean;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  title = "File Preview",
  allowDownload = false
}: FilePreviewModalProps) {
  if (!isOpen) return null;

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = imageUrl;
  //   link.download = `receipt-${Date.now()}.jpg`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const downloadFile = async () => {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

    try {
      const response = await fetch(fileUrl);
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
      alert(`Failed to download file: ${err.message}`);
    }
  }


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const previewUrl = fileUrl.replace("http://31.97.125.62:5000/", "http://www.sahamtradingplc.com/")
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>{title}</span>
          </h2>
          <div className="flex items-center space-x-2">
            {allowDownload && (
              <button
                onClick={downloadFile}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download File"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* File Container */}
        <div className="p-4 max-h-[80vh] overflow-auto">
          <div className="flex justify-center">
            {isPdf ? (
              <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                className="rounded-lg shadow-lg border-0"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.png';
                  target.alt = 'Image not found';
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Click outside the file or press the X button to close
            </p>
            <div className="flex space-x-2">
              {allowDownload && (
                <button
                  onClick={downloadFile}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}