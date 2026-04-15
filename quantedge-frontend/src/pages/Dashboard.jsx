import React, { useState } from 'react';

const Dashboard = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/market/trend/${symbol}`);
      const result = await response.json();
      setData({
        symbol,
        trend: result.trend || "UNKNOWN",
        sma50: result.sma50 || "0.00",
        sma200: result.sma200 || "0.00",
        rsi14: result.rsi14 || "0.00",
      });
    } catch (error) {
      console.error("Failed to fetch market data", error);
      // Fallback local mock if backend is down
      setData({
        symbol,
        trend: "ERROR",
        sma50: "0.00",
        sma200: "0.00",
        rsi14: "0.00",
      });
    }
    setLoading(false);
  };

  const getTrendClass = (trend) => {
    const t = trend.toUpperCase();
    if(t === 'BULLISH') return 'trend-positive';
    if(t === 'BEARISH' || t === 'ERROR') return 'trend-negative';
    return 'trend-neutral';
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <section className="search-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="page-title">Market Analysis</h2>
        <div className="search-bar" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <input 
            type="text" 
            className="glass-input"
            style={{ width: '300px', padding: '0.75rem 1rem', fontSize: '1rem' }}
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter Stock Symbol (e.g. MSFT)" 
          />
          <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </section>

      {data && (
        <section className="results-panel animate-fade-in delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card trend-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Overall Trend ({data.symbol})</h3>
              <p className={`trend ${getTrendClass(data.trend)}`} style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                {data.trend}
              </p>
            </div>
          </div>
          
          <div className="indicators-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>50-Day SMA</h4>
              <p className="value" style={{ fontSize: '2rem', fontWeight: '600' }}>${data.sma50}</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>200-Day SMA</h4>
              <p className="value" style={{ fontSize: '2rem', fontWeight: '600' }}>${data.sma200}</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>14-Day RSI</h4>
              <p className="value" style={{ fontSize: '2rem', fontWeight: '600' }}>{data.rsi14}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
