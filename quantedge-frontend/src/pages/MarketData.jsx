import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useRegion } from '../context/RegionContext.jsx';
import { getTickersForRegion } from '../utils/marketData.js';

const MarketData = () => {
  const { region, formatCurrency } = useRegion();
  const [symbol, setSymbol] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('candlestick');

  const tickers = getTickersForRegion(region);

  const handleFetch = async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/market/history/${symbol.toUpperCase()}?days=90`);
      const data = await response.json();
      setHistory(data.sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate))); // newest first
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const chartDataReversed = [...history].reverse();

  const candlestickSeries = [{
    name: 'Candlestick',
    data: chartDataReversed.map(h => ({
      x: new Date(h.tradeDate).getTime(),
      y: [h.openPrice, h.highPrice, h.lowPrice, h.closePrice]
    }))
  }];

  const lineSeries = [{
    name: 'Close Price',
    data: chartDataReversed.map(h => ({
      x: new Date(h.tradeDate).getTime(),
      y: h.closePrice
    }))
  }];

  const chartOptions = {
    chart: {
      type: viewMode === 'candlestick' ? 'candlestick' : 'area',
      background: 'transparent',
      toolbar: { show: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    theme: { mode: 'dark' },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: '#94a3b8' },
        formatter: (value) => formatCurrency(value)
      }
    },
    grid: { borderColor: 'rgba(255, 255, 255, 0.05)', strokeDashArray: 3 },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10b981', downward: '#f43f5e' },
        wick: { useFillColor: true }
      }
    },
    stroke: { curve: 'smooth', width: viewMode === 'candlestick' ? 1 : 2 },
    fill: {
      type: viewMode === 'candlestick' ? 'solid' : 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] }
    },
    colors: ['#00f0ff'],
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false }
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <section className="search-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="page-title">{region} Market Data Explorer</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Interactive timeline representing up to 90 days of historical data.</p>
        <div className="search-bar" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <input 
            type="text" 
            className="glass-input"
            list="region-tickers"
            value={symbol} 
            style={{ width: '300px', padding: '0.75rem 1rem', fontSize: '1rem' }}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder={`Enter Symbol (e.g. ${tickers[0]})`} 
          />
          <datalist id="region-tickers">
            {tickers.map(t => <option key={t} value={t} />)}
          </datalist>

          <button className="btn-primary" onClick={handleFetch} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </section>

      {history.length > 0 && (
        <section className="results-panel animate-fade-in delay-100">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{symbol.toUpperCase()} <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '400' }}>Timeline</span></h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setViewMode('candlestick')} className={viewMode === 'candlestick' ? 'btn-primary' : 'btn-outline'} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Candlesticks</button>
                <button onClick={() => setViewMode('line')} className={viewMode === 'line' ? 'btn-primary' : 'btn-outline'} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Line Graph</button>
                <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'btn-primary' : 'btn-outline'} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Data Table</button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>Date</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>Open</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>High</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>Low</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>Close</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <td style={{ padding: '1rem', color: '#888' }}>{h.tradeDate}</td>
                        <td style={{ padding: '1rem' }}>{formatCurrency(h.openPrice)}</td>
                        <td style={{ padding: '1rem' }}>{formatCurrency(h.highPrice)}</td>
                        <td style={{ padding: '1rem' }}>{formatCurrency(h.lowPrice)}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: h.closePrice >= h.openPrice ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                          {formatCurrency(h.closePrice)}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{h.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '0', borderRadius: '8px' }}>
                <ReactApexChart key={viewMode} options={chartOptions} series={viewMode === 'candlestick' ? candlestickSeries : lineSeries} type={viewMode === 'candlestick' ? 'candlestick' : 'area'} height={450} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MarketData;
