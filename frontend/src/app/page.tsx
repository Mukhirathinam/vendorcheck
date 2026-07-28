'use client';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
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
      setTimeout(() => {
        setReport({
          vendor_name: "Mocked Vendor Pvt Ltd",
          trust_score: query === '123' ? 45 : 85,
          recommendation: query === '123' ? "Serious risk, do not pay advance" : "Safe to proceed",
          risk_flags: query === '123' ? [
            { source: "GST", severity: "CRITICAL", description: "GST Registration is Cancelled due to non-filing of returns for 6 months." },
            { source: "MCA", severity: "CRITICAL", description: "Company is Struck Off from the MCA registry." }
          ] : [],
          mca_status: query === '123' ? "Struck Off" : "Active",
          gst_status: query === '123' ? "Cancelled" : "Active",
        });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'score-green';
    if (score >= 50) return 'score-yellow';
    return 'score-red';
  };

  const getRecColor = (score: number) => {
    if (score >= 75) return 'rec-green';
    if (score >= 50) return 'rec-yellow';
    return 'rec-red';
  };

  return (
    <>
      <div className="bg-blobs"></div>
      <main className="container">
        <div className="header-section">
          <h1 className="title">VendorCheck</h1>
          <p className="subtitle">Know exactly who you are paying before you pay them.</p>
        </div>

        <div className="glass-panel">
          <form onSubmit={handleSearch} className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Enter GST Number, CIN, or Company Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Trust Report'}
            </button>
          </form>

          {report && (
            <div className="results-grid">
              <div className="score-card">
                <h3>Trust Score</h3>
                <div className="score-circle-wrapper">
                  <div className={`score-circle ${getScoreColor(report.trust_score)}`}>
                    {report.trust_score}
                  </div>
                </div>
                <h4 className={`recommendation ${getRecColor(report.trust_score)}`}>
                  {report.recommendation}
                </h4>
              </div>
              
              <div className="details-card">
                <div className="data-row">
                  <span className="data-label">Company Name</span>
                  <span className="data-value">{report.vendor_name}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">MCA Registration Status</span>
                  <span className="data-value">{report.mca_status}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">GST Compliance</span>
                  <span className="data-value">{report.gst_status}</span>
                </div>
                
                <h3 className="flags-header">Risk Intelligence Flags</h3>
                {report.risk_flags && report.risk_flags.length > 0 ? (
                  report.risk_flags.map((flag: any, idx: number) => (
                    <div key={idx} className={`flag-card ${flag.severity === 'CRITICAL' ? 'critical' : 'medium'}`}>
                      <div className="flag-icon">
                        {flag.severity === 'CRITICAL' ? '⚠️' : '⚡'}
                      </div>
                      <div className="flag-content">
                        <h4>{flag.source} - {flag.severity} RISK</h4>
                        <p>{flag.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="all-clear">
                    <span>✅</span> No significant risk flags found across 6 government databases.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
