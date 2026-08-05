'use client';
import { useState } from 'react';
import { setToken } from '@/lib/auth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/v1/login' : '/api/v1/register';
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.access_token);
        window.location.href = '/'; // Redirect to dashboard
      } else {
        alert(data.detail || "Authentication failed");
      }
    } catch (err) {
      alert("Error connecting to server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-app)', alignItems: 'center', justifyContent: 'center'}}>
      <div className="bg-blobs"></div>
      
      <div className="card" style={{width: '100%', maxWidth: '400px', zIndex: 2}}>
        <h2 style={{fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center'}}>VendorCheck</h2>
        <p style={{color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem'}}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label style={{display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none'}}
            />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none'}}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%', justifyContent: 'center'}} disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-secondary)'}}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600}}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
}
