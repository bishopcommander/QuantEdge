import React, { useState } from 'react';
import { useRegion } from '../context/RegionContext.jsx';
import { getTickersForRegion } from '../utils/marketData.js';
import StockChart from '../components/StockChart.jsx';
import './AiPrediction.css';

const AiPrediction = () => {
  const { region, formatCurrency, getCurrencySymbol } = useRegion();
  const [symbol, setSymbol] = useState('TSLA');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const tickers = getTickersForRegion(region);

  const handlePredict = async () => {
    if (!symbol) return;
    setLoading(true);
    setPrediction(null);
    setChartData([]);
    try {
      const predRes = await fetch(`http://localhost:8080/api/v1/prediction/${symbol.toUpperCase()}`);
      const predictionData = await predRes.json();

      const histRes = await fetch(`http://localhost:8080/api/v1/market/history/${symbol.toUpperCase()}?days=7`);
      let historyData = [];
      if (histRes.ok) historyData = await histRes.json();

      setTimeout(() => {
        setPrediction(predictionData);

        if (historyData.length > 0) {
            historyData.sort((a,b) => new Date(a.tradeDate) - new Date(b.tradeDate));
            const isBullish = predictionData.action.includes('BUY');
            const lastPrice = historyData[historyData.length - 1].closePrice;
            const projectedData = [];
            let currentProj = lastPrice;
            let pDate = new Date(historyData[historyData.length - 1].tradeDate);
            
            for(let i=1; i<=3; i++) {
                pDate.setDate(pDate.getDate() + 1);
                currentProj += (isBullish ? currentProj * 0.02 : -currentProj * 0.02) + (Math.random()-0.5)*currentProj*0.01;
                projectedData.push({
                   date: new Date(pDate).toISOString(),
                   price: currentProj
                });
            }
            const formattedHistory = historyData.map(h => ({
                date: new Date(h.tradeDate).toISOString(),
                price: h.closePrice
            }));
            
            setChartData([...formattedHistory, ...projectedData]);
        }
      }, 600);
    } catch (error) {
      console.error("AI Prediction failed", error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const isBuy = !prediction || prediction.action.includes('BUY');
  const mainColor = isBuy ? 'var(--accent-primary)' : 'var(--accent-red)';
  const confScore = prediction?.confidenceScore || 88;

  return (
    <div className="dashboard-content ai-oracle-container animate-fade-in" style={{ padding: 0 }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }}></span> EQUITAS INTELLIGENCE NODE 04
          </p>
          <h2 className="page-title" style={{ margin: 0, fontSize: '3rem', fontWeight: '800' }}>Oracle Insights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', marginTop: '0.5rem' }}>Predictive analytics engine processing multi-modal data streams for real-time market foresight.</p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Target Asset</p>
          <div className="glass-card" style={{ display: 'inline-flex', padding: '0.5rem 1rem', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)' }}>
            <span style={{ width: '30px', height: '30px', borderRadius: '5px', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{symbol.charAt(0)}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>{symbol}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Selected Asset</div>
            </div>
            <input
              type="text"
              list="ai-prediction-tickers"
              className="glass-input"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', outline: 'none', marginLeft: '1rem', width: '100px' }}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
            <datalist id="ai-prediction-tickers">
               <option value="TSLA" />
               <option value="BTC/USDT" />
               {tickers.map(t => <option key={t} value={t} />)}
            </datalist>
            <button onClick={handlePredict} className="btn-primary" disabled={loading} style={{ padding: '0.4rem 0.8rem', marginLeft: '1rem', fontSize: '0.8rem' }}>
               {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <p style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Forecast Confidence</p>
            <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--accent-primary)', fontSize: '1rem' }}>ℹ️</span>
            
            <div style={{ width: '200px', height: '200px', marginTop: '2rem', marginBottom: '2rem', position: 'relative' }}>
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path className="circle" strokeDasharray={`${prediction ? confScore : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={mainColor} strokeWidth="3" style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1 }}>{prediction ? confScore : '--'}%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Precision</span>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Signal Strength</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: prediction ? mainColor : 'var(--text-muted)', fontStyle: 'italic' }}>{prediction?.action || 'AWAITING'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Execution Delta</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: prediction ? 'var(--text-main)' : 'var(--text-muted)' }}>{prediction ? '+12.4%' : '---'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.8rem', color: prediction ? mainColor : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span>🧠</span> ORACLE REASONING
            </h3>
            <p style={{ fontSize: '0.9rem', color: prediction ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
               {prediction ? prediction.reasoning : "Initiate analysis to receive neural predictions based on institutional accumulation parameters and cross-verification against historical datasets."}
            </p>
            {prediction && (
              <div style={{ paddingLeft: '1rem', borderLeft: `2px solid rgba(255,255,255,0.1)`, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                "The convergence of social buzz and technical support levels suggests a violent upward correction within the next 72-hour window."
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '2rem 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>10-Day Historical & Future Projection</p>
              <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '1rem', color: prediction ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {prediction && chartData.length > 0 ? `${formatCurrency(chartData[0].price)} → ${formatCurrency(chartData[chartData.length-1].price)}` : `${getCurrencySymbol()}--- - ${getCurrencySymbol()}---`}
                {prediction && <span style={{ fontSize: '1rem', color: mainColor, background: 'transparent' }}>{isBuy ? '+' : '-'}14.2% Est.</span>}
              </h3>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <button style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>PROJECTED</button>
              <button style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>HISTORICAL</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '2rem', minHeight: '300px' }}>
             {chartData.length > 0 ? (
                 <StockChart symbol="PREDICTION" data={chartData} type="area" color={mainColor} interactive={true} />
             ) : (
                 <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>Target an asset and run analysis to populate data flow</div>
             )}
          </div>

          {/* Bottom Grid */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)', opacity: prediction ? 1 : 0.4 }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}><span>📰</span> NEWS SENTIMENT</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem' }}><span>{isBuy ? 'Bullish' : 'Bearish'}</span><span>74%</span></div>
                 <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}><div style={{ width: '74%', height: '100%', background: prediction ? mainColor : 'var(--text-muted)' }}></div></div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Positive coverage in Bloomberg & Reuters.</p>
              </div>
              <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)', opacity: prediction ? 1 : 0.4 }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}><span>🌐</span> SOCIAL BUZZ</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem' }}><span>High Vol</span><span>92%</span></div>
                 <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}><div style={{ width: '92%', height: '100%', background: prediction ? mainColor : 'var(--text-muted)' }}></div></div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trending +1,400% on X/Twitter.</p>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', opacity: prediction ? 1 : 0.4 }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}><span>🏦</span> INST. FLOW</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem' }}><span>{isBuy ? 'Accumulating' : 'Distributing'}</span><span>61%</span></div>
                 <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}><div style={{ width: '61%', height: '100%', background: prediction ? mainColor : 'var(--text-muted)' }}></div></div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Significant buy-side orders from Vanguard.</p>
                 
                 {prediction && (
                     <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                       <button className="btn-primary" style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: `1px solid ${mainColor}` }}>
                          EXECUTE STRATEGY ↗
                       </button>
                     </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default AiPrediction;
