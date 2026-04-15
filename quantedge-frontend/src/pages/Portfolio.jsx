import React, { useState, useEffect } from 'react';
import { useRegion } from '../context/RegionContext.jsx';

const Portfolio = () => {
  const { region, formatCurrency } = useRegion();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/portfolios');
        const data = await response.json();
        setHoldings(data);
      } catch (error) {
        console.error("Failed to fetch portfolio data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
  const dayGain = 12402.18; // Mock value to mirror design

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Equitas Portfolio</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Balance</p>
            <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>{formatCurrency(totalPortfolioValue || 1248592)}</p>
            <p className="neon-text" style={{ fontSize: '0.85rem', margin: 0 }}>↗ +1.2% versus last week</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Day's Gain/Loss</p>
            <p className="neon-text" style={{ fontSize: '2.25rem', fontWeight: '700', margin: '0' }}>+{formatCurrency(dayGain)}</p>
            <div><span style={{ fontSize: '0.7rem', background: 'rgba(0,255,136,0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '2px', fontWeight: 'bold' }}>DAILY PERFORMANCE HIGH</span></div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Score</p>
            <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-red)', margin: '0' }}>64 <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>/ 100</span></p>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
              <div style={{ width: '64%', height: '100%', background: 'var(--accent-red)', borderRadius: '2px' }}></div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Current Holdings</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Viewing: Primary Portfolio</p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="neon-text" style={{ fontSize: '1.2rem', animation: 'pulseGlow 2s infinite' }}>Loading your positions...</p>
        </div>
      ) : (
        <div className="glass-card animate-fade-in delay-100" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Ticker</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Price</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Day Change</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Allocation</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', textAlign: 'right' }}>Market Value</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const cost = h.quantity * h.averagePrice;
                const allocation = totalPortfolioValue > 0 ? (cost / totalPortfolioValue) * 100 : 0;
                // Mock change to demonstrate Red/Green colors
                const isPositive = i % 2 !== 0; 
                return (
                  <tr key={h.id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>{h.symbol.substring(0,3)}</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{h.symbol}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Asset</div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(h.averagePrice)}</td>
                    <td style={{ padding: '1.25rem', fontWeight: '500', color: isPositive ? 'var(--accent-primary)' : 'var(--accent-red)' }}>
                      {isPositive ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${allocation}%`, height: '100%', background: 'var(--text-muted)', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '30px' }}>{allocation.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-main)', textAlign: 'right', fontSize: '1.1rem' }}>{formatCurrency(cost)}</td>
                  </tr>
                );
              })}
              {holdings.length === 0 && (
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>BTC</span>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Bitcoin</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital Asset</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(67241.10)}</td>
                  <td style={{ padding: '1.25rem', fontWeight: '500', color: 'var(--accent-primary)' }}>+4.12%</td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `45%`, height: '100%', background: 'var(--text-muted)', borderRadius: '2px' }}></div></div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '30px' }}>45%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-main)', textAlign: 'right', fontSize: '1.1rem' }}>{formatCurrency(561866)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Portfolio
