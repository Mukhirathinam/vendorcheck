'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

const Icons = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Invoice: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
};

export default function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on login screen
  if (pathname === '/login') return null;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-badge">
          <Icons.Logo />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>VendorCheck</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(99,102,241,0.25)', color: '#818cf8', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.4)', fontWeight: 800 }}>V3.2</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.5px' }}>
            AI DUE DILIGENCE ENGINE
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 0.5rem 0.5rem' }}>
          Intelligence Core
        </div>
        
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
          <Icons.Dashboard /> Analytics
        </Link>
        <Link href="/search" className={`nav-item ${pathname === '/search' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
          <Icons.Search /> Due Diligence
        </Link>
        <Link href="/history" className={`nav-item ${pathname === '/history' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
          <Icons.History /> Report History
        </Link>
        <Link href="/invoice" className={`nav-item ${pathname === '/invoice' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
          <Icons.Invoice /> Invoice Verify
        </Link>
        <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
          <Icons.Settings /> Settings & API
        </Link>

        {/* System Status Card */}
        <div style={{
          marginTop: 'auto',
          marginBottom: '1rem',
          padding: '0.85rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icons.Shield /> 6 Sources Live
            </span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            MCA • GST • eCourts • NCLT • RBI • 100+ News Journals
          </div>
        </div>
        
        {/* Logout */}
        <div 
          className="nav-item" 
          onClick={logout} 
          style={{ color: 'var(--danger)', cursor: 'pointer', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)' }}
        >
          <Icons.LogOut /> Sign Out
        </div>
      </nav>
    </aside>
  );
}
