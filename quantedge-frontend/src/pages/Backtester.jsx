import React, { useState } from 'react';
import { useRegion } from '../context/RegionContext.jsx';
import { getTickersForRegion } from '../utils/marketData.js';
import StockChart from '../components/StockChart.jsx';
import { runBacktest } from '../utils/backtestEngine.js';

const Backtester = () => {
  const { region, formatCurrency, getCurrencySymbol } = useRegion();
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [capital, setCapital] = useState('100000');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [tradeLogs, setTradeLogs] = useState([]);
  const [timeframe, setTimeframe] = useState('3M');
  const [strategyType, setStrategyType] = useState('sma_crossover');

  // Strategy Specific Parameters
  const [tpPercent, setTpPercent] = useState(15);
  const [slPercent, setSlPercent] = useState(5);
  const [fastSMA, setFastSMA] = useState(50);
  const [slowSMA, setSlowSMA] = useState(200);
  const [rsiLength, setRsiLength] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);
  const [macdFast, setMacdFast] = useState(12);
  const [macdSlow, setMacdSlow] = useState(26);
  const [macdSignal, setMacdSignal] = useState(9);
  const [bbLength, setBbLength] = useState(20);
  const [bbStdDev, setBbStdDev] = useState(2.0);

  const strategyTooltips = {
    sma_crossover: "Generates a BUY signal when the fast Simple Moving Average crosses above the slow Simple Moving Average.",
    rsi_reversal: "Executes trades based on overbought (>70) and oversold (<30) momentum thresholds.",
    macd_trend: "Follows trend momentum using the divergence between two moving averages.",
    mean_reversion: "Capitalizes on extreme price movements to mean-revert to historical averages (Bollinger Bands)."
  };

  const tickers = getTickersForRegion(region);

  const handleTest = async () => {
    if (!symbol) return;
    setLoading(true);
    setResult(null);
    setChartData([]);
    setTradeLogs([]);

    try {
      const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;
      
      // We purposefully fetch up to +200 days extra to allow indicator buffering (like 200 SMA)
      const fetchDays = days + 210; 
      
      const response = await fetch(`http://localhost:8080/api/v1/market/history/${symbol.toUpperCase()}?days=${fetchDays}`);
      if (!response.ok) throw new Error("Failed to fetch market data");
      const historyData = await response.json();
      
      const strategyConfig = {
          type: strategyType,
          tpPercent: parseFloat(tpPercent),
          slPercent: parseFloat(slPercent),
          params: {
              fastPeriod: parseInt(fastSMA),
              slowPeriod: parseInt(slowSMA),
              rsiLength: parseInt(rsiLength),
              oversold: parseFloat(rsiOversold),
              overbought: parseFloat(rsiOverbought),
              fast: parseInt(macdFast),
              slow: parseInt(macdSlow),
              signal: parseInt(macdSignal),
              bbLength: parseInt(bbLength),
              bbStdDev: parseFloat(bbStdDev)
          }
      };

      // Ensure execution frame isolates to just the visible requested timeframe
      setTimeout(() => {
          const simResult = runBacktest(historyData, capital, strategyConfig);
          if (simResult) {
               // Only show the chart data for the requested timeframe, clipping the warmup period
               const clippedChart = simResult.chartData.slice(-days);
               simResult.chartData = clippedChart;
               
               setResult(simResult);
               setChartData(simResult.chartData);
               setTradeLogs(simResult.logs);
          } else {
               alert("Not enough historical data to generate a reliable backtest for the selected metrics.");
          }
          setLoading(false);
      }, 500);

    } catch (error) {
      console.error("Backtest failed", error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content animate-fade-in" style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>EQUITAS TERMINAL</p>
          <h2 className="page-title" style={{ margin: 0, fontSize: '2rem' }}>Strategy Backtester</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" style={{ background: 'var(--bg-card)', border: 'none' }}>💾 Save Preset</button>
          <button className="btn-primary" onClick={handleTest} disabled={loading}>
            {loading ? 'Simulating...' : '▶ Run Simulation'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚙️</span> CONFIGURATION
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Strategy Type</span>
                <span title={strategyTooltips[strategyType]} style={{ cursor: 'help', color: 'var(--accent-primary)', fontSize: '1rem' }}>ℹ️</span>
              </label>
              <select className="glass-select" value={strategyType} onChange={(e) => setStrategyType(e.target.value)} style={{ width: '100%' }}>
                <option value="sma_crossover">SMA Crossover</option>
                <option value="rsi_reversal">RSI Reversal</option>
                <option value="macd_trend">MACD Trend Following</option>
                <option value="mean_reversion">Mean Reversion</option>
              </select>
            </div>

            {strategyType === 'sma_crossover' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Fast Period</label>
                  <input type="number" className="glass-input" value={fastSMA} onChange={e => setFastSMA(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Slow Period</label>
                  <input type="number" className="glass-input" value={slowSMA} onChange={e => setSlowSMA(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
            )}
            
            {strategyType === 'rsi_reversal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>RSI Length</label>
                  <input type="number" className="glass-input" value={rsiLength} onChange={e => setRsiLength(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Oversold / Overbought</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="glass-input" value={rsiOversold} onChange={e => setRsiOversold(e.target.value)} style={{ width: '50%' }} title="Oversold Threshold" />
                    <input type="number" className="glass-input" value={rsiOverbought} onChange={e => setRsiOverbought(e.target.value)} style={{ width: '50%' }} title="Overbought Threshold" />
                  </div>
                </div>
              </div>
            )}
            
            {strategyType === 'macd_trend' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Fast</label>
                  <input type="number" className="glass-input" value={macdFast} onChange={e => setMacdFast(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Slow</label>
                  <input type="number" className="glass-input" value={macdSlow} onChange={e => setMacdSlow(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Signal</label>
                  <input type="number" className="glass-input" value={macdSignal} onChange={e => setMacdSignal(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {strategyType === 'mean_reversion' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Bollinger Length</label>
                  <input type="number" className="glass-input" value={bbLength} onChange={e => setBbLength(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Std. Dev.</label>
                  <input type="number" step="0.1" className="glass-input" value={bbStdDev} onChange={e => setBbStdDev(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Asset</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={symbol} 
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                  list="backtester-tickers"
                  style={{ width: '100%' }} 
                />
                <datalist id="backtester-tickers">
                  <option value="BTC/USDT" />
                  <option value="ETH/USDT" />
                  {tickers.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Candle Interval</label>
                <select className="glass-select" defaultValue="1d" style={{ width: '100%' }}>
                  <option value="15m">15 Minute</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hour</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Initial Capital ({getCurrencySymbol()})</label>
              <input type="number" className="glass-input" value={capital} onChange={(e) => setCapital(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Take Profit (%)</label>
                <input type="number" className="glass-input" value={tpPercent} onChange={e => setTpPercent(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Stop Loss (%)</label>
                <input type="number" className="glass-input" value={slPercent} onChange={e => setSlPercent(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Win Rate</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: 0 }}>{result ? `${result.metrics.winRate}%` : '-%'} <span style={{fontSize:'1rem'}}>↗</span></p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Profit Factor</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{result ? result.metrics.profitFactor : '-'}</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Max Drawdown</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent-red)', margin: 0 }}>{result ? `-${result.metrics.maxDrawdown}%` : '-%'}</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Trades</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{result ? result.metrics.totalTrades : '-'}</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Chart card */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Equity Curve Analysis</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cumulative performance relative to benchmark</p>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <button onClick={() => setTimeframe('1M')} style={{ padding: '0.4rem 0.8rem', background: timeframe === '1M' ? '#fff' : 'transparent', color: timeframe === '1M' ? '#000' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>1M</button>
                <button onClick={() => setTimeframe('3M')} style={{ padding: '0.4rem 0.8rem', background: timeframe === '3M' ? '#fff' : 'transparent', color: timeframe === '3M' ? '#000' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>3M</button>
                <button onClick={() => setTimeframe('6M')} style={{ padding: '0.4rem 0.8rem', background: timeframe === '6M' ? '#fff' : 'transparent', color: timeframe === '6M' ? '#000' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>6M</button>
                <button onClick={() => setTimeframe('YTD')} style={{ padding: '0.4rem 0.8rem', background: timeframe === 'YTD' ? '#fff' : 'transparent', color: timeframe === 'YTD' ? '#000' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>YTD</button>
              </div>
            </div>
            
            <div style={{ height: '280px', width: '100%', marginBottom: '2rem' }}>
              {chartData.length > 0 ? (
                <StockChart symbol={`${symbol} Equity`} data={chartData} type="area" color="#00ff88" interactive={true} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>Run Simulation to generate equity curve</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
               <div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Net Profit</p>
                 <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: result ? (result.netProfit >= 0 ? 'var(--accent-primary)' : 'var(--accent-red)') : 'var(--text-muted)', margin: 0 }}>
                   {result ? `${result.netProfit >= 0 ? '+' : '-'}${formatCurrency(Math.abs(result.netProfit))}` : '-'}
                 </p>
               </div>
               <div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Final Capital</p>
                 <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                    {result ? formatCurrency(result.finalCapital) : '-'}
                 </p>
               </div>
               <div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg. Trade Duration</p>
                 <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{result ? '2d 6h' : '-'}</p>
               </div>
            </div>
          </div>

          {/* Trade log */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> SIMULATION TRADE LOG
              </h3>
              <button className="btn-outline" disabled={tradeLogs.length === 0} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: 'none', cursor: tradeLogs.length > 0 ? 'pointer' : 'default', opacity: tradeLogs.length > 0 ? 1 : 0.5 }}>DOWNLOAD CSV 📥</button>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Entry Price</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Exit Price</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reason</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeLogs.length > 0 ? tradeLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{log.id}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ color: log.type === 'LONG' ? 'var(--accent-primary)' : 'var(--accent-red)', background: log.type === 'LONG' ? 'rgba(0,255,136,0.1)' : 'rgba(255,77,77,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{log.type}</span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-main)' }}>{formatCurrency(log.entry)}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-main)' }}>{formatCurrency(log.exit)}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.reason}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: log.profit >= 0 ? 'var(--accent-primary)' : 'var(--accent-red)', textAlign: 'right', fontWeight: 'bold' }}>
                        {log.profit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(log.profit))}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trades executed in this timeframe.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtester;
