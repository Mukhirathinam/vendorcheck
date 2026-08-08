import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle2, AlertTriangle, Info, Loader2, Download, AlertCircle, Building2, User, Phone, MapPin } from 'lucide-react';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type TabType = 'registered' | 'informal';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('registered');
  const [gstin, setGstin] = useState('');
  
  // Registered Vendor State
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [progressState, setProgressState] = useState<Record<string, 'pending' | 'checking' | 'done' | 'risk' | 'unavailable'>>({
    gst: 'pending',
    mca: 'pending',
    ecourts: 'pending',
    nclt: 'pending',
    rbi: 'pending',
    news: 'pending'
  });
  
  const [finalScore, setFinalScore] = useState(0);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [riskFlags, setRiskFlags] = useState<any[]>([]);

  // Informal Vendor State
  const [informalForm, setInformalForm] = useState({
    businessName: '',
    ownerName: '',
    mobileNumber: '',
    city: ''
  });
  const [informalStarted, setInformalStarted] = useState(false);

  const handleSearch = async () => {
    if (!gstin) return;
    
    setIsSearching(true);
    setSearchComplete(false);
    setProgressState({
      gst: 'checking',
      mca: 'pending',
      ecourts: 'pending',
      nclt: 'pending',
      rbi: 'pending',
      news: 'pending'
    });

    // Simulate SSE / Live progress
    const steps = ['gst', 'mca', 'ecourts', 'nclt', 'rbi', 'news'];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setProgressState(prev => ({ ...prev, [step]: 'checking' }));
      
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      
      setProgressState(prev => ({ 
        ...prev, 
        [step]: Math.random() > 0.8 ? 'risk' : 'done' 
      }));
    }

    // Mock API response after "streaming"
    setTimeout(() => {
      setIsSearching(false);
      setSearchComplete(true);
      setFinalScore(78);
      setBreakdown({
        gst: { score: 25, max: 25, label: 'GST Compliance' },
        mca: { score: 20, max: 20, label: 'MCA Filings' },
        ecourts: { score: 15, max: 20, label: 'Litigation (eCourts)' },
        nclt: { score: 10, max: 10, label: 'NCLT/IBBI' },
        rbi: { score: 5, max: 15, label: 'RBI/SEBI Defaulters' },
        news: { score: 3, max: 10, label: 'Adverse News' }
      });
      setRiskFlags([
        { id: 1, level: 'HIGH', title: 'Pending Litigation', description: '2 pending cases found in District Court regarding payment disputes.' },
        { id: 2, level: 'CRITICAL', title: 'Adverse News', description: 'Recent news articles mention regulatory scrutiny over environmental compliance.' }
      ]);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-green';
    if (score >= 50) return 'score-yellow';
    return 'score-red';
  };

  const renderProgressIcon = (status: string) => {
    switch (status) {
      case 'checking': return <Loader2 className="animate-spin text-brand-primary" size={20} />;
      case 'done': return <CheckCircle2 className="text-success" size={20} />;
      case 'risk': return <AlertTriangle className="text-danger" size={20} />;
      case 'unavailable': return <Info className="text-text-tertiary" size={20} />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-border-color" />;
    }
  };

  const progressLabels: Record<string, string> = {
    gst: 'GST Portal Verification',
    mca: 'MCA21 Database Check',
    ecourts: 'eCourts Litigation Search',
    nclt: 'NCLT / IBBI Insolvency',
    rbi: 'RBI / SEBI Defaulters List',
    news: 'Google Adverse Media'
  };

  const handleInformalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInformalStarted(true);
  };

  return (
    <div>
      <div className="dashboard-title">
        <h2>Vendor Verification</h2>
      </div>

      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          Registered Vendor (GSTIN)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'informal' ? 'active' : ''}`}
          onClick={() => setActiveTab('informal')}
        >
          Informal Vendor (No GSTIN)
        </button>
      </div>

      {activeTab === 'registered' ? (
        <div className="card max-w-4xl">
          <div className="header-search-bar !mb-0 !border-border-color">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Enter GSTIN to verify..." 
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              disabled={isSearching}
              maxLength={15}
            />
            <button 
              className="btn-primary" 
              onClick={handleSearch}
              disabled={!gstin || isSearching || gstin.length < 15}
            >
              {isSearching ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {/* Live Progress Panel */}
          {isSearching && (
            <div className="progress-panel">
              {Object.entries(progressState).map(([key, status]) => (
                <div key={key} className={`progress-item ${status}`}>
                  <div className="progress-item-left">
                    {renderProgressIcon(status)}
                    <span>{progressLabels[key]}</span>
                  </div>
                  <span className="text-sm text-text-tertiary capitalize">{status === 'pending' ? 'Waiting' : status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Results View */}
          {searchComplete && !isSearching && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-color">
                <h3 className="text-xl font-bold">Analysis Results</h3>
                <button className="btn-secondary">
                  <Download size={16} /> Export PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-bg-surface-hover rounded-2xl border border-border-color">
                  <div className={`circular-score score-animated ${getScoreColor(finalScore)}`}>
                    {finalScore}
                  </div>
                  <span className="text-text-secondary font-medium">Overall Trust Score</span>
                  <span className="text-sm mt-2 font-bold text-success">Low Risk Vendor</span>
                </div>

                <div className="col-span-2">
                  <h4 className="font-semibold mb-4 text-text-secondary">Score Breakdown</h4>
                  <div className="breakdown-grid !mt-0">
                    {Object.entries(breakdown).map(([key, data]: [string, any]) => (
                      <div key={key} className="breakdown-card">
                        <span className="breakdown-title">{data.label}</span>
                        <div className="breakdown-score-wrap">
                          <span className="breakdown-score">{data.score}</span>
                          <span className="breakdown-max">/ {data.max}</span>
                        </div>
                        <div className="breakdown-bar-bg">
                          <div 
                            className="breakdown-score-bar" 
                            style={{ 
                              width: `${(data.score / data.max) * 100}%`,
                              backgroundColor: (data.score / data.max) > 0.7 ? 'var(--success)' : (data.score / data.max) > 0.4 ? 'var(--warning)' : 'var(--danger)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {riskFlags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4 text-text-secondary flex items-center gap-2">
                    <AlertCircle size={18} /> Identified Risk Flags
                  </h4>
                  <div className="flag-list">
                    {riskFlags.map((flag) => (
                      <div key={flag.id} className={`flag-box ${flag.level}`}>
                        <AlertTriangle size={24} className={flag.level === 'CRITICAL' ? 'text-danger' : 'text-warning'} />
                        <div>
                          <h4>{flag.title}</h4>
                          <p>{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card max-w-2xl">
          <div className="card-header">
            <User size={20} /> Informal Vendor Verification
          </div>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Verify vendors without a GSTIN using their basic business and owner details. We utilize alternative data sources and identity checks.
          </p>

          {!informalStarted ? (
            <form onSubmit={handleInformalSubmit}>
              <div className="form-group">
                <label>Business / Shop Name</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-3.5 text-text-tertiary" />
                  <input 
                    type="text" 
                    className="pl-10 w-full"
                    placeholder="e.g. Sharma Hardware Store"
                    required
                    value={informalForm.businessName}
                    onChange={e => setInformalForm({...informalForm, businessName: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Owner Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-text-tertiary" />
                  <input 
                    type="text" 
                    className="pl-10 w-full"
                    placeholder="e.g. Ramesh Sharma"
                    required
                    value={informalForm.ownerName}
                    onChange={e => setInformalForm({...informalForm, ownerName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-text-tertiary" />
                    <input 
                      type="tel" 
                      className="pl-10 w-full"
                      placeholder="e.g. 9876543210"
                      pattern="[0-9]{10}"
                      required
                      value={informalForm.mobileNumber}
                      onChange={e => setInformalForm({...informalForm, mobileNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>City / Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-text-tertiary" />
                    <input 
                      type="text" 
                      className="pl-10 w-full"
                      placeholder="e.g. Mumbai"
                      required
                      value={informalForm.city}
                      onChange={e => setInformalForm({...informalForm, city: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-4">
                Start Verification
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-brand-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Verification Initiated</h3>
              <p className="text-text-secondary max-w-sm mb-6">
                A WhatsApp OTP and consent request will be sent to <strong>{informalForm.mobileNumber}</strong> shortly to begin the identity verification process.
              </p>
              <button className="btn-secondary" onClick={() => setInformalStarted(false)}>
                Verify Another Vendor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
