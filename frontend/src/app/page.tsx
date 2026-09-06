'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSavedAudits, AuditReport } from '@/lib/storage';

export default function AnalyticsDashboard() {
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real audits performed by user from storage
    const loaded = getSavedAudits();
    setAudits(loaded);
    setLoading(false);
  }, []);

  const totalAudits = audits.length;
  const avgScore = totalAudits > 0 
    ? parseFloat((audits.reduce((acc, a) => acc + a.trust_score, 0) / totalAudits).toFixed(2)) 
    : 0;
  const lowRiskCount = audits.filter(a => a.trust_score >= 75).length;
  const criticalCount = audits.filter(a => a.trust_score < 35).length;
  const mediumCount = audits.filter(a => a.trust_score >= 35 && a.trust_score < 75).length;

  if (loading) {
    return (
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
      </main>
    );
  }

  return (
    <main className="main-content" style={{ maxWidth: '1380px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          MISSION CONTROL HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1527 0%, #151d38 50%, #0d1527 100%)',
        borderRadius: '1.25rem',
        padding: '2.25rem 2.75rem',
        marginBottom: '2rem',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-70px', right: '15%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '2.5px', color: '#818cf8', textTransform: 'uppercase' }}>
              Mission Control Dashboard
            </span>
            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>
              ENTERPRISE LEDGER
            </span>
          </div>

          <h1 style={{ fontSize: '2.35rem', fontWeight: 900, color: '#fff', margin: '0 0 0.65rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Executive Vendor Risk & Due Diligence Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: '750px', lineHeight: 1.6 }}>
            Live intelligence ledger consolidating audits across MCA, GST, eCourts litigation, NCLT insolvency proceedings, and 100+ financial journals.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          REAL-TIME METRIC COUNTERS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Vendors Audited', val: totalAudits, color: '#fff', desc: 'Entities in ledger' },
          { label: 'Mean Trust Score', val: totalAudits > 0 ? avgScore : '—', color: '#38bdf8', desc: 'Weighted average' },
          { label: 'Low Risk Vendors', val: lowRiskCount, color: '#10b981', desc: 'Score ≥ 75' },
          { label: 'High / Critical Risk', val: criticalCount, color: '#ef4444', desc: 'Score < 35 — flag for review' },
        ].map((s, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {s.label}
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '0.4rem', color: s.color, lineHeight: 1.1 }}>
              {s.val}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.45rem' }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          RECENT ACTIVITY LEDGER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
              Verified Due Diligence Ledger
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Accurate records with multi-dimensional decimal scoring and risk categorization.
            </p>
          </div>

          <Link href="/search" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}>
            + Run New Vendor Audit
          </Link>
        </div>

        {totalAudits === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
              color: '#818cf8'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>
              No Companies in Your Ledger Yet
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Your ledger only records companies you explicitly audit. Head over to Due Diligence to scan any GSTIN or Corporate entity.
            </p>
            <Link href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>
              Launch First Due Diligence Audit
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Audit Date</th>
                  <th>Company / Entity Name</th>
                  <th>GSTIN / Identifier</th>
                  <th>Trust Score (Exact)</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((r) => {
                  const isCritical = r.trust_score < 35;
                  const isHigh = r.trust_score >= 35 && r.trust_score < 55;
                  const isMedium = r.trust_score >= 55 && r.trust_score < 75;
                  const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : isMedium ? '#eab308' : '#10b981';
                  const bg = isCritical ? 'rgba(239,68,68,0.1)' : isHigh ? 'rgba(249,115,22,0.1)' : isMedium ? 'rgba(234,179,8,0.1)' : 'rgba(16,185,129,0.1)';
                  const riskLabel = isCritical ? 'CRITICAL RISK' : isHigh ? 'HIGH RISK' : isMedium ? 'MEDIUM RISK' : 'LOW RISK';

                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{r.date}</td>
                      <td style={{ fontWeight: 800, color: '#fff' }}>{r.company_name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.cin_or_gstin}</td>
                      <td>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color }}>
                          {r.trust_score} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 100</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, background: bg, color, border: `1px solid ${color}33` }}>
                          {riskLabel}
                        </span>
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
