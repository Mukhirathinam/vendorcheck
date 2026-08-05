'use client';
import { useEffect } from 'react';
import { getToken } from '@/lib/auth';

export default function SettingsPage() {
  useEffect(() => {
    if (!getToken()) window.location.href = '/login';
  }, []);

  return (
    <main className="main-content">
      <div className="dashboard-title">
        <h2>Settings & API Keys</h2>
      </div>
      <div className="card" style={{maxWidth: '600px'}}>
        <div style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>Account Plan</h3>
          <div className="badge badge-success" style={{marginBottom: '1rem'}}>Enterprise Plan</div>
          <p style={{color: 'var(--text-secondary)'}}>You have unlimited Due Diligence queries.</p>
        </div>
        
        <div style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>VendorCheck API Key</h3>
          <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>Use this key to automate checks from your ERP or backend.</p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <input type="text" readOnly value="vc_live_8f7d9a8c7b6..." style={{flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-tertiary)'}} />
            <button className="btn-secondary" onClick={() => alert('Copied!')}>Copy</button>
          </div>
        </div>
      </div>
    </main>
  );
}
