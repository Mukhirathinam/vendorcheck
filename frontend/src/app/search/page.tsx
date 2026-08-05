'use client';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const Icons = {
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportId, setReportId] = useState<number | null>(null);

  useEffect(() => {
    if (!getToken()) window.location.href = '/login';
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setReport(null);
    setReportId(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/v1/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query_type: 'gstin', query_value: query })
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setReport(data);
      if (data.report_id) setReportId(data.report_id);
    } catch (err) {
      alert("Error generating report. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (s: number) => s >= 75 ? 'badge-success' : s >= 50 ? 'badge-warning' : 'badge-danger';
  const getColor = (s: number) => s >= 75 ? 'score-green' : s >= 50 ? 'score-yellow' : 'score-red';
  const getText = (s: number) => s >= 75 ? 'text-green' : s >= 50 ? 'text-yellow' : 'text-red';

  return (
    <main className="main-content">
      <form onSubmit={handleSearch} className="header-search-bar">
        <Icons.Search />
        <input
          type="text"
          placeholder="Enter a 15-digit GSTIN for real data (e.g. 29ABCDE1234F1Z5), or type '123' for demo fraud case..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </form>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {query.length === 15
              ? 'Querying Setu — live government data...'
              : 'Aggregating data from 6 government databases...'}
          </p>
        </div>
      )}

      {!loading && !report && (
        <div className="empty-state">
          <Icons.Search />
          <h2>No vendor selected</h2>
          <p>Enter a real 15-digit GSTIN to get live government data, or any other query for a demo report.</p>
        </div>
      )}

      {!loading && report && (
        <div className="dashboard-content">
          <div className="dashboard-title">
            <div>
              <h2>{report.identity.company_name}</h2>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                {report.identity.cin} | Generated Today
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className={`badge ${getBadge(report.trust_score)}`}>
                {report.trust_score >= 75 ? <Icons.Check /> : <Icons.Alert />}
                {report.recommendation}
              </div>
              {reportId ? (
                <a
                  href={`${API_URL}/api/v1/report/${reportId}/pdf?token=${getToken()}`}
                  className="btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.Download /> Export PDF
                </a>
              ) : (
                <button onClick={() => window.print()} className="btn-secondary">
                  <Icons.Download /> Export PDF
                </button>
              )}
            </div>
          </div>

          <div className="grid-layout">
            {/* Score */}
            <div className="card score-container">
              <h3 className="card-header" style={{ border: 'none', justifyContent: 'center' }}>Trust Score</h3>
              <div className={`circular-score ${getColor(report.trust_score)}`}>{report.trust_score}</div>
              <p className={`score-text ${getText(report.trust_score)}`} style={{ marginBottom: '1rem' }}>{report.recommendation}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Based on AI aggregation of MCA, GST, eCourts, NCLT, EPFO, and RBI records.
              </p>
            </div>

            {/* Details */}
            <div className="grid-layout-right">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Corporate Identity */}
                <div className="card">
                  <h3 className="card-header"><Icons.Building /> Corporate Identity</h3>
                  <div className="details-grid single">
                    <div className="detail-item">
                      <span className="detail-label">Registered Address</span>
                      <span className="detail-value">{report.identity.address}</span>
                    </div>
                    <div className="details-grid" style={{ marginTop: '0.5rem' }}>
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
                      <span className={`detail-value ${report.gst_compliance.status === 'Active' || report.gst_compliance.status === 'ACT' ? 'text-green' : 'text-red'}`}>
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
                <div className="details-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="detail-item">
                    <span className="detail-label">NCLT Cases</span>
                    <span className={`detail-value ${report.legal.nclt_cases > 0 ? 'text-red' : ''}`}>{report.legal.nclt_cases}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Civil Cases</span>
                    <span className="detail-value">{report.legal.civil_cases}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">RBI Defaulter</span>
                    <span className={`detail-value ${report.legal.rbi_defaulter ? 'text-red' : 'text-green'}`}>{report.legal.rbi_defaulter ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Disqualified Directors</span>
                    <span className={`detail-value ${report.directors.disqualified_directors > 0 ? 'text-red' : ''}`}>
                      {report.directors.disqualified_directors} / {report.directors.total_directors}
                    </span>
                  </div>
                </div>

                {report.risk_flags && report.risk_flags.length > 0 ? (
                  <div className="flag-list">
                    {report.risk_flags.map((flag: any, idx: number) => (
                      <div key={idx} className={`flag-box ${flag.severity}`}>
                        <div style={{ color: flag.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', marginTop: '2px' }}>
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
                  <div className="flag-box" style={{ borderColor: 'var(--success)', background: 'var(--success-bg)' }}>
                    <div style={{ color: 'var(--success)' }}><Icons.Check /></div>
                    <div>
                      <h4 style={{ color: 'var(--success)' }}>No Significant Risks Found</h4>
                      <p>No derogatory data found in the analyzed databases.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
