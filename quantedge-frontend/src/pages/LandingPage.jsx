import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import StockChart from '../components/StockChart';
import './LandingPage.css';

const LandingPage = () => {
  const { token, loading } = useAuth();
  const { formatCurrency } = useRegion();

  return (
    <div className="landing-container">
      <div className="landing-overlay">
        
        {/* Navigation for Landing Page */}
        <nav className="landing-nav">
          <h1 className="landing-logo">QuantEdge</h1>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            {!loading && (
              token ? (
                <Link to="/app" className="nav-login-btn">Open App</Link>
              ) : (
                <>
                  <Link to="/signin" className="nav-login-btn" style={{ background: 'transparent', border: '1px solid #aaa' }}>Sign In</Link>
                  <Link to="/signup" className="nav-login-btn" style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>Sign Up</Link>
                </>
              )
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Track your assets.<br /><span className="highlight-ai">Backtest strategies.</span></h2>
            <p className="hero-subtitle">
              A web-based terminal that lets you track your portfolio, run technical indicators on historical data, and get AI-driven price confidence scores.
            </p>
            <div className="hero-actions">
              {!loading && (
                token ? (
                  <Link to="/app" className="cta-primary">
                    Open Dashboard
                    <span className="cta-arrow">→</span>
                  </Link>
                ) : (
                  <Link to="/signup" className="cta-primary">
                    Try QuantEdge
                    <span className="cta-arrow">→</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </header>

        {/* Features Highlights */}
        <section id="features" className="features-section">
          <div className="feature-card">
            <div style={{ marginBottom: '20px', background: 'var(--bg-dark)', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}><span>Asset</span><span>Price</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px' }}><span>AAPL</span><span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(220.50)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '500' }}><span>NVDA</span><span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(118.25)}</span></div>
            </div>
            <h3>Portfolio Tracking</h3>
            <p>Monitor real-time positions and calculate your immediate profit and loss with fluid data synchronization.</p>
          </div>
          
          <div className="feature-card">
            <div style={{ marginBottom: '20px', height: '100px', background: 'var(--bg-dark)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
               <StockChart symbol="Demo" interactive={false} data={[120, 118, 122, 125, 121, 130, 135]} type="line" />
            </div>
            <h3>Strategy Backtester</h3>
            <p>Test SMA, MACD, and RSI crossover strategies using historical market data before risking real capital.</p>
          </div>
          
          <div className="feature-card">
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', height: '100px', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
               <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #2d2d2d', borderTopColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  87%
               </div>
               <div style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</span>
                 <span style={{ color: '#fff', fontWeight: '600', letterSpacing: '1px' }}>BULLISH</span>
               </div>
            </div>
            <h3>AI Prediction Oracle</h3>
            <p>Get AI confidence scores based on technical patterns before you enter a trade.</p>
          </div>
        </section>

        <footer className="landing-footer">
          <p>&copy; 2026 QuantEdge Platform. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
