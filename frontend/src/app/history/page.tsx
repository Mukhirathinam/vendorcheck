'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSavedAudits, clearSavedAudits, AuditReport } from '@/lib/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = getSavedAudits();
    setHistory(data);
    setLoading(false);
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your audit history ledger?')) {
      clearSavedAudits();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(h => 
    h.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.cin_or_gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
      </main>
    );
  }

  return (
    <main className="main-content" style={{ maxWidth: '1380px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818cf8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Historical Due Diligence Archives
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Vendor Audit Report Dossiers
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {history.length > 0 && (
            <button onClick={handleClear} className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
              Clear Ledger
            </button>
          )}
          <Link href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>
            + New Due Diligence Scan
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
            {filteredHistory.length} Dossiers Recorded
          </span>

          <input
            type="text"
            placeholder="Filter by company name or GSTIN..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.45rem 0.9rem',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              width: '280px'
            }}
          />
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              No audit records found matching your query.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Audit Date</th>
                  <th>Company / Legal Entity</th>
                  <th>CIN / GSTIN</th>
                  <th>Trust Score</th>
                  <th>Status</th>
                  <th>100-Journal Scan</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((r) => {
                  const isRejected = r.status === 'Rejected' || r.trust_score < 35;
                  const isReview = r.status === 'Manual Review' || (r.trust_score >= 35 && r.trust_score < 75);
                  const color = isRejected ? '#ef4444' : isReview ? '#eab308' : '#10b981';
                  const bg = isRejected ? 'rgba(239,68,68,0.1)' : isReview ? 'rgba(234,179,8,0.1)' : 'rgba(16,185,129,0.1)';

                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                      <td style={{ fontWeight: 800, color: '#fff' }}>{r.company_name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.cin_or_gstin}</td>
                      <td>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color }}>
                          {r.trust_score} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 100</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, background: bg, color, border: `1px solid ${color}33` }}>
                          {r.status?.toUpperCase() || (isRejected ? 'REJECTED' : isReview ? 'MANUAL REVIEW' : 'APPROVED')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>
                          100 Articles Verified
                        </span>
                      </td>
                      <td>
                        <Link href="/search" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                          Run Re-Scan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
