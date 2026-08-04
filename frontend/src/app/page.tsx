'use client';
import { useState } from 'react';

// Icons as SVG components to avoid external dependencies
const Icons = {
  Logo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  History: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_type: 'gst', query_value: query })
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      alert("Make sure the FastAPI backend is running on port 8000!");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getBadgeClass = (score: number) => {
    if (score >= 75) return 'badge-success';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'score-green';
    if (score >= 50) return 'score-yellow';
    return 'score-red';
  };

  const getScoreText = (score: number) => {
    if (score >= 75) return 'text-green';
    if (score >= 50) return 'text-yellow';
    return 'text-red';
  };

  const renderHistory = () => (
    <div className="dashboard-content">
      <div className="dashboard-title">
        <h2>Report History</h2>
      </div>
      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date Analyzed</th>
              <th>Company Name</th>
              <th>CIN / Identifier</th>
              <th>Trust Score</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aug 04, 2026</td>
              <td>Reliance Retail Limited</td>
              <td>U01100MH1999PLC120563</td>
              <td><span className="text-green" style={{fontWeight: 700}}>92</span></td>
              <td><span className="badge badge-success">Approved</span></td>
              <td><button className="btn-secondary" onClick={() => setActiveTab('dashboard')}>View</button></td>
            </tr>
            <tr>
              <td>Aug 03, 2026</td>
              <td>Fraudsters Trading Pvt Ltd</td>
              <td>U52100KA2021PTC145678</td>
              <td><span className="text-red" style={{fontWeight: 700}}>24</span></td>
              <td><span className="badge badge-danger">Rejected</span></td>
              <td><button className="btn-secondary" onClick={() => setActiveTab('dashboard')}>View</button></td>
            </tr>
            <tr>
              <td>Jul 28, 2026</td>
              <td>Infosys Limited</td>
              <td>L85110KA1981PLC013115</td>
              <td><span className="text-green" style={{fontWeight: 700}}>98</span></td>
              <td><span className="badge badge-success">Approved</span></td>
              <td><button className="btn-secondary" onClick={() => setActiveTab('dashboard')}>View</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Icons.Logo />
          VendorCheck
        </div>
        
        <nav>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Icons.Dashboard /> Due Diligence
          </div>
          <div 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Icons.History /> Report History
          </div>
          <div className="nav-item">
            <Icons.Settings /> Settings & API
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Search Header */}
        <form onSubmit={handleSearch} className="header-search-bar">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search by GSTIN, CIN, or Company Name (Try '123' for fraud case)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveTab('dashboard'); // Switch back to dashboard when typing
            }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </form>

        {activeTab === 'history' ? (
          renderHistory()
        ) : (
          <>
            {loading && (
              <div className="loader-container">
                <div className="spinner"></div>
                <p style={{color: 'var(--text-secondary)'}}>Aggregating data from 6 government databases...</p>
              </div>
            )}

            {!loading && !report && (
              <div className="empty-state">
                <Icons.Search />
                <h2>No vendor selected</h2>
                <p>Enter a GST number or Company Name above to generate a comprehensive trust report.</p>
              </div>
            )}

            {!loading && report && (
              <div className="dashboard-content">
                <div className="dashboard-title">
                  <div>
                    <h2>{report.identity.company_name}</h2>
                    <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400}}>
                      CIN: {report.identity.cin} | Generated Today
                    </span>
                  </div>
                  <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <div className={`badge ${getBadgeClass(report.trust_score)}`}>
                      {report.trust_score >= 75 ? <Icons.Check /> : <Icons.Alert />}
                      {report.recommendation}
                    </div>
                    <button onClick={handlePrint} className="btn-secondary">
                      <Icons.Download /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="grid-layout">
                  {/* Left Column: Score */}
                  <div className="card score-container">
                    <h3 className="card-header" style={{border: 'none', justifyContent: 'center'}}>Overall Trust Score</h3>
                    <div className={`circular-score ${getScoreColor(report.trust_score)}`}>
                      {report.trust_score}
                    </div>
                    <p className={`score-text ${getScoreText(report.trust_score)}`} style={{marginBottom: '1rem'}}>
                      {report.recommendation}
                    </p>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      Based on AI aggregation of MCA, GST, eCourts, NCLT, EPFO, and RBI records.
                    </p>
                  </div>

                  {/* Right Column: Detailed Data */}
                  <div className="grid-layout-right">
                    
                    {/* Identity & Legal Grid */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                      {/* Company Identity */}
                      <div className="card">
                        <h3 className="card-header"><Icons.Building /> Corporate Identity</h3>
                        <div className="details-grid single">
                          <div className="detail-item">
                            <span className="detail-label">Registered Address</span>
                            <span className="detail-value">{report.identity.address}</span>
                          </div>
                          <div className="details-grid" style={{marginTop: '0.5rem'}}>
                            <div className="detail-item">
                              <span className="detail-label">Incorp. Date</span>
                              <span className="detail-value">{report.identity.incorporation_date}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Paid-up Capital</span>
                              <span className="detail-value">{report.identity.paid_up_capital}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GST Compliance */}
                      <div className="card">
                        <h3 className="card-header"><Icons.FileText /> Tax & Compliance</h3>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">GSTIN</span>
                            <span className="detail-value">{report.gst_compliance.gstin}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">GST Status</span>
                            <span className={`detail-value ${report.gst_compliance.status === 'Active' ? 'text-green' : 'text-red'}`}>
                              {report.gst_compliance.status}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Taxpayer Type</span>
                            <span className="detail-value">{report.gst_compliance.taxpayer_type}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Last Return Filed</span>
                            <span className="detail-value">{report.gst_compliance.last_return_filed}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legal & Risk Flags */}
                    <div className="card">
                      <h3 className="card-header"><Icons.Scale /> Legal Intelligence & Risk Flags</h3>
                      
                      {/* Key Metrics Row */}
                      <div className="details-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
                        <div className="detail-item">
                          <span className="detail-label">NCLT Cases</span>
                          <span className={`detail-value ${report.legal.nclt_cases > 0 ? 'text-red' : ''}`}>{report.legal.nclt_cases}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Civil Court Cases</span>
                          <span className="detail-value">{report.legal.civil_cases}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">RBI Defaulter</span>
                          <span className={`detail-value ${report.legal.rbi_defaulter ? 'text-red' : 'text-green'}`}>{report.legal.rbi_defaulter ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Disqualified Directors</span>
                          <span className={`detail-value ${report.directors.disqualified_directors > 0 ? 'text-red' : ''}`}>{report.directors.disqualified_directors} / {report.directors.total_directors}</span>
                        </div>
                      </div>

                      {/* Flag List */}
                      {report.risk_flags && report.risk_flags.length > 0 ? (
                        <div className="flag-list">
                          {report.risk_flags.map((flag: any, idx: number) => (
                            <div key={idx} className={`flag-box ${flag.severity}`}>
                              <div style={{color: flag.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', marginTop: '2px'}}>
                                <Icons.Alert />
                              </div>
                              <div>
                                <h4>{flag.source} Flag ({flag.severity})</h4>
                                <p>{flag.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flag-box" style={{borderColor: 'var(--success)', background: 'var(--success-bg)'}}>
                          <div style={{color: 'var(--success)'}}><Icons.Check /></div>
                          <div>
                            <h4 style={{color: 'var(--success)'}}>No Significant Risks Found</h4>
                            <p>No derogatory data found in the 6 analyzed databases.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
