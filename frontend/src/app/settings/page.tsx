'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('vc_live_9a8c7b6e5d4f3a210987654321fedcba');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818cf8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Configuration & Integration
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>
          Settings & Enterprise API Keys
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Subscription Plan Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              Subscription Tier & Limits
            </h3>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
              ENTERPRISE UNLIMITED
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            Your account has direct, high-throughput access to our 6 parallel regulatory scrapers (MCA, GSTN, eCourts, NCLT, RBI/SEBI) and continuous 100-journal adverse media crawling.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Audit Quota</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Unlimited</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>API Rate Limit</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>500 req / min</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>SLA Guarantee</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>99.95% Uptime</div>
            </div>
          </div>
        </div>

        {/* Production API Keys Card */}
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
            Production REST API Key
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            Integrate VendorCheck due diligence directly into your ERP (SAP, Oracle, Tally, Zoho) or procurement workflows.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#818cf8'
            }}>
              vc_live_9a8c7b6e5d4f3a210987654321fedcba
            </div>
            <button onClick={handleCopy} className="btn-primary" style={{ padding: '0.75rem 1.5rem', minWidth: '110px' }}>
              {copied ? '✓ Copied' : 'Copy Key'}
            </button>
          </div>
        </div>

        {/* Live Setu / GSTN External Gateway Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              External Government & Setu KYC API Gateway
            </h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 800 }}>
              OPTIONAL LIVE CONNECTOR
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            If you have direct Setu KYC API credentials or Government Portal Gateway keys, you can connect them in your backend <code style={{ color: '#818cf8', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>backend/.env</code> file for live NIC GST & MCA verification.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <span style={{ color: '#64748b' }}># Add to backend/.env for live Setu GSTN integration:</span><br/>
            <span style={{ color: '#38bdf8' }}>SETU_CLIENT_ID</span>=<span style={{ color: '#10b981' }}>your_setu_client_id_here</span><br/>
            <span style={{ color: '#38bdf8' }}>SETU_CLIENT_SECRET</span>=<span style={{ color: '#10b981' }}>your_setu_client_secret_here</span><br/>
            <span style={{ color: '#38bdf8' }}>SETU_BASE_URL</span>=<span style={{ color: '#10b981' }}>https://dg-sandbox.setu.co</span>
          </div>
        </div>
      </div>
    </main>
  );
}
