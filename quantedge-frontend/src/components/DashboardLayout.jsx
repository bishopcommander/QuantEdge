import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useRegion } from '../context/RegionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardLayout = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { region, setRegion } = useRegion();
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="top-nav glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <div className="nav-logo" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '1px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              QUANTEDGE.FI
            </Link>
          </h1>
        </div>
        
        <div className="nav-links" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <Link to="/app" className={location.pathname === '/app' ? 'active' : ''}>Dashboard</Link>
          <Link to="/app/portfolio" className={location.pathname === '/app/portfolio' ? 'active' : ''}>Portfolio</Link>
          <Link to="/app/backtest" className={location.pathname === '/app/backtest' ? 'active' : ''}>Strategy</Link>
          <Link to="/app/ai-oracle" className={`neon-text ${location.pathname === '/app/ai-oracle' ? 'active' : ''}`}>Oracle</Link>
          <Link to="/app/market" className={location.pathname === '/app/market' ? 'active' : ''}>Markets</Link>
        </div>

        <div className="nav-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="glass-select"
            style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          >
            <option value="US" style={{background: '#0a0f1c'}}>US</option>
            <option value="Europe" style={{background: '#0a0f1c'}}>EU</option>
            <option value="India" style={{background: '#0a0f1c'}}>IN</option>
            <option value="Crypto" style={{background: '#0a0f1c'}}>Crypto</option>
          </select>
          
          <span style={{ cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem' }}>🔔</span>
          <div style={{ position: 'relative' }}>
            <span 
              onClick={() => setShowSettings(!showSettings)}
              style={{ cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem' }}
            >
              ⚙️
            </span>
            {showSettings && (
              <div className="glass-card animate-fade-in" style={{ 
                position: 'absolute', top: '150%', right: '0', padding: '1rem', 
                minWidth: '220px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '1rem' 
              }}>
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Platform Settings
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>Live Market Data</span>
                  <div style={{ position: 'relative', width: '32px', height: '18px', background: 'var(--accent-primary)', borderRadius: '9px', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '2px', left: '16px', width: '14px', height: '14px', background: '#0b101b', borderRadius: '50%' }}></div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>Push Notifications</span>
                  <div style={{ position: 'relative', width: '32px', height: '18px', background: 'var(--accent-primary)', borderRadius: '9px', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '2px', left: '16px', width: '14px', height: '14px', background: '#0b101b', borderRadius: '50%' }}></div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>Pro Interface Mode</span>
                  <div style={{ position: 'relative', width: '32px', height: '18px', background: 'rgba(255,255,255,0.2)', borderRadius: '9px', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px', background: '#fff', borderRadius: '50%' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                   <span style={{ fontSize: '0.85rem' }}>Theme Base</span>
                   <select className="glass-select" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: '90px' }}>
                      <option>Obsidian</option>
                      <option>Midnight</option>
                   </select>
                </div>
              </div>
            )}
          </div>
          <div 
            onClick={logout}
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'var(--accent-primary)', color: '#0b101b', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
            }}
            title="Logout"
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
