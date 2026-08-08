import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function InvoicePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [resultsReady, setResultsReady] = useState(false);

  const steps = [
    'Extracting invoice data (OCR)...',
    'Validating GSTIN with GST Portal...',
    'Checking for duplicate invoices...',
    'Verifying seller name matches MCA...',
    'Analyzing amount patterns...'
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFile(selectedFile);
    startProcessing();
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setProcessStep(0);
    setResultsReady(false);

    // Simulate step-by-step processing
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setResultsReady(true);
        }, 1000);
      } else {
        setProcessStep(currentStep);
      }
    }, 1200);
  };

  return (
    <div>
      <div className="dashboard-title mb-2">
        <h2>Invoice Fraud Detection</h2>
      </div>
      <p className="text-text-secondary mb-8 text-lg">
        Upload any invoice PDF to instantly verify authenticity against GST, MCA, and historical patterns.
      </p>

      {!isProcessing && !resultsReady && (
        <div 
          className={`drop-zone max-w-3xl mx-auto ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".pdf"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          />
          <UploadCloud className="drop-icon" />
          <div>
            <h3 className="text-xl font-bold mb-2">Drop PDF here or click to browse</h3>
            <p className="text-text-tertiary">Supported formats: PDF (Max 5MB)</p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="card max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-color">
            <FileText size={32} className="text-brand-primary" />
            <div>
              <h3 className="font-bold text-lg">{file?.name}</h3>
              <p className="text-sm text-text-secondary">Processing document...</p>
            </div>
          </div>

          <div className="processing-steps">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-item ${
                  index < processStep ? 'done' : 
                  index === processStep ? 'active' : ''
                }`}
              >
                <div className="step-icon-wrap">
                  {index < processStep ? <CheckCircle2 size={16} /> :
                   index === processStep ? <Loader2 size={16} className="animate-spin" /> : 
                   <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <span className={index === processStep ? 'text-brand-primary font-medium' : ''}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resultsReady && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
          <div className="card border-success/30 bg-success/5 mb-6 text-center py-8">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-success" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-success mb-2">Invoice Verified ✓</h2>
            <p className="text-text-secondary">No suspicious patterns detected. All cross-checks passed.</p>
            
            <button className="btn-secondary mx-auto mt-6" onClick={() => { setFile(null); setResultsReady(false); }}>
              Upload Another Invoice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="card-header">Extracted Data</h3>
              <div className="details-grid single">
                <div className="detail-item">
                  <span className="detail-label">Invoice Number</span>
                  <span className="detail-value">INV-2023-4451</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Invoice Date</span>
                  <span className="detail-value">12 Oct 2023</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value font-bold text-lg">₹ 1,45,000.00</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seller GSTIN</span>
                  <span className="detail-value">27AADCB2230M1Z2</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Buyer GSTIN</span>
                  <span className="detail-value">29GGGGG1314R9Z6</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-header">Verification Checks</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-medium">GSTIN Valid & Active</p>
                    <p className="text-sm text-text-secondary">Seller GSTIN is active and matches document.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-medium">No Duplicates Found</p>
                    <p className="text-sm text-text-secondary">This invoice number hasn't been submitted before.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-medium">Amount Anomaly Check</p>
                    <p className="text-sm text-text-secondary">Value falls within historical vendor averages.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-medium">Bank Details Match</p>
                    <p className="text-sm text-text-secondary">Account details match registered vendor info.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
