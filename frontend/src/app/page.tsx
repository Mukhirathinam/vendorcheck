'use client';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('http://localhost:8000/api/v1/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(() => {
      window.location.href = '/login';
    });
  }, []);

  if (loading) return <main className="main-content"><div className="loader-container"><div className="spinner"></div></div></main>;

  return (
    <main className="main-content">
      <div className="dashboard-title">
        <h2>Analytics Overview</h2>
      </div>

      <div className="details-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
        <div className="card" style={{padding: '1.5rem'}}>
          <span className="detail-label">Total Vendors Analyzed</span>
          <div style={{fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem'}}>{data.total}</div>
        </div>
        <div className="card" style={{padding: '1.5rem'}}>
          <span className="detail-label">Average Trust Score</span>
          <div style={{fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--brand-primary)'}}>{data.avg_score}</div>
        </div>
        <div className="card" style={{padding: '1.5rem'}}>
          <span className="detail-label">Approved Vendors</span>
          <div style={{fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--success)'}}>{data.approved}</div>
        </div>
        <div className="card" style={{padding: '1.5rem'}}>
          <span className="detail-label">Rejected Vendors</span>
          <div style={{fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--danger)'}}>{data.rejected}</div>
        </div>
      </div>

      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <h3 className="card-header" style={{padding: '1.5rem', marginBottom: 0}}>Recent Activity</h3>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Company Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.length === 0 ? (
              <tr><td colSpan={3} style={{textAlign: 'center', padding: '2rem'}}>No searches yet.</td></tr>
            ) : (
              data.recent.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td style={{fontWeight: 600}}>{r.company_name}</td>
                  <td>
                    <span className={r.score >= 75 ? 'text-green' : r.score >= 50 ? 'text-yellow' : 'text-red'} style={{fontWeight: 700}}>
                      {r.score}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
