'use client';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('http://localhost:8000/api/v1/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      setHistory(data);
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
            {history.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No reports found.</td></tr>
            ) : (
              history.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td style={{fontWeight: 600}}>{r.company_name}</td>
                  <td>{r.cin}</td>
                  <td>
                    <span className={r.trust_score >= 75 ? 'text-green' : r.trust_score >= 50 ? 'text-yellow' : 'text-red'} style={{fontWeight: 700}}>
                      {r.trust_score}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td><button className="btn-secondary" onClick={() => window.location.href = '/search'}>New Search</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
