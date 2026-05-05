import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

const PaymentUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedProof, setUploadedProof] = useState(null);
  const [remarks, setRemarks] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('trade_id', 'trade-' + Date.now());

    try {
      const response = await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedProof(response.data);
      toast.success('Payment proof uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trading')}
              className="flex items-center gap-2 rounded-sm border border-input px-3 py-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trading
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold">Payment Proof Upload</h1>
              <p className="text-xs text-muted-foreground">Submit transaction verification</p>
            </div>
          </div>
          <div className="rounded-sm bg-secondary/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Account</p>
            <p className="font-mono text-sm font-semibold">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-3xl p-6">
        <div className="space-y-6">
          {!uploadedProof ? (
            <>
              {/* Upload Instructions */}
              <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
                <h3 className="mb-2 font-semibold">Upload Instructions:</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Upload clear photo or PDF of your payment receipt</li>
                  <li>Ensure transaction details are visible</li>
                  <li>Supported formats: JPG, PNG, PDF</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-sm border-2 border-dashed p-12 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card/40 hover:border-primary/50 hover:bg-card/60'
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                {uploading ? (
                  <p className="font-medium">Uploading...</p>
                ) : isDragActive ? (
                  <p className="font-medium text-primary">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="mb-2 font-medium">Drag & drop your payment proof here</p>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="rounded-sm border border-border bg-card/40 p-6">
                <label className="mb-2 block text-sm font-medium">Transaction Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any additional information about this transaction..."
                  rows={4}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          ) : (
            /* Success State */
            <div className="rounded-sm border border-success bg-success/5 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 font-heading text-2xl font-bold">Payment Proof Uploaded!</h3>
              <p className="mb-4 text-muted-foreground">
                Your payment proof has been submitted for verification
              </p>
              
              <div className="mx-auto max-w-md rounded-sm bg-card/40 p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Transaction Reference Code</p>
                <p className="font-mono text-xl font-bold text-primary">{uploadedProof.reference_code}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Save this reference code for tracking
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/trading')}
                  className="rounded-sm bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Back to Trading
                </button>
                <button
                  onClick={() => {
                    setUploadedProof(null);
                    setRemarks('');
                  }}
                  className="rounded-sm border border-input px-6 py-2 font-medium hover:bg-accent"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentUploadPage;
