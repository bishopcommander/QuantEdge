import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from './indicators';

export const runBacktest = (historyData, initialCapital, strategyConfig) => {
  if (!historyData || historyData.length < 50) return null;
  // Sort ascending
  const data = [...historyData].sort((a,b) => new Date(a.tradeDate) - new Date(b.tradeDate));
  
  const { type, tpPercent, slPercent, params } = strategyConfig;
  
  // Calculate Indicators
  const smaFast = type === 'sma_crossover' ? calculateSMA(data, params.fastPeriod) : [];
  const smaSlow = type === 'sma_crossover' ? calculateSMA(data, params.slowPeriod) : [];
  
  const rsiLine = type === 'rsi_reversal' ? calculateRSI(data, params.rsiLength) : [];
  
  const macdData = type === 'macd_trend' ? calculateMACD(data, params.fast, params.slow, params.signal) : [];
  
  const bbData = type === 'mean_reversion' ? calculateBollingerBands(data, params.bbLength, params.bbStdDev) : [];

  let capital = parseFloat(initialCapital);
  let holdings = 0; // Quantity of asset held
  let position = null; // null, 'LONG', 'SHORT' (we'll just support LONG for standard equity unless requested)
  let entryPrice = 0;
  
  const logs = [];
  const chartData = [];
  
  // Keep track of peaks and troughs for drawdown
  let maxEquity = capital;
  let maxDrawdown = 0;
  
  let winCount = 0;
  let lossCount = 0;
  let profitFactorGains = 0;
  let profitFactorLosses = 0;

  for(let i = 0; i < data.length; i++) {
    const currentPrice = data[i].closePrice;
    const dateStr = new Date(data[i].tradeDate).toISOString();
    
    let equity = capital + (holdings * currentPrice);
    if (equity > maxEquity) maxEquity = equity;
    
    let drawdown = (maxEquity - equity) / maxEquity * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;

    chartData.push({ date: dateStr, price: equity });

    // Ensure we have enough data (skip warmup period)
    if (i < 50) continue; 

    // Stop Loss / Take profit Checks for active LONG positions
    if (position === 'LONG') {
        const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
        
        if (pnlPercent >= tpPercent || pnlPercent <= -slPercent) {
            // Close position
            const profit = (currentPrice - entryPrice) * holdings;
            capital += currentPrice * holdings;
            logs.push({
                id: `#${Math.floor(Math.random()*9000)+1000}`,
                date: dateStr,
                type: 'LONG',
                status: 'CLOSED',
                reason: pnlPercent >= tpPercent ? 'TAKE PROFIT' : 'STOP LOSS',
                entry: entryPrice.toFixed(2),
                exit: currentPrice.toFixed(2),
                profit: profit
            });
            if (profit > 0) { winCount++; profitFactorGains += profit; }
            else { lossCount++; profitFactorLosses += Math.abs(profit); }
            
            holdings = 0;
            position = null;
            continue; // Skip evaluating entry on the same tick
        }
    }

    // Trading Logic Evaluator
    let buySignal = false;
    let sellSignal = false; // "sell" means close long in this context since we don't hold short balances

    if (type === 'sma_crossover') {
       if (smaFast[i-1] <= smaSlow[i-1] && smaFast[i] > smaSlow[i]) buySignal = true;
       if (smaFast[i-1] >= smaSlow[i-1] && smaFast[i] < smaSlow[i]) sellSignal = true;
    } 
    else if (type === 'rsi_reversal') {
       if (rsiLine[i-1] > params.oversold && rsiLine[i] <= params.oversold) buySignal = true;
       if (rsiLine[i-1] < params.overbought && rsiLine[i] >= params.overbought) sellSignal = true;
    }
    else if (type === 'macd_trend') {
       if (macdData[i-1]?.histogram <= 0 && macdData[i]?.histogram > 0) buySignal = true;
       if (macdData[i-1]?.histogram >= 0 && macdData[i]?.histogram < 0) sellSignal = true;
    }
    else if (type === 'mean_reversion') {
       if (currentPrice < bbData[i]?.lower) buySignal = true;
       if (currentPrice > bbData[i]?.upper) sellSignal = true;
    }

    // Execute Signals
    if (buySignal && position === null) {
        position = 'LONG';
        entryPrice = currentPrice;
        holdings = capital / currentPrice;
        capital = 0; // All in
    } else if (sellSignal && position === 'LONG') {
        const profit = (currentPrice - entryPrice) * holdings;
        capital = currentPrice * holdings;
        logs.push({
            id: `#${Math.floor(Math.random()*9000)+1000}`,
            date: dateStr,
            type: 'LONG',
            status: 'CLOSED',
            reason: 'STRATEGY EXIT',
            entry: entryPrice.toFixed(2),
            exit: currentPrice.toFixed(2),
            profit: profit
        });
        if (profit > 0) { winCount++; profitFactorGains += profit; }
        else { lossCount++; profitFactorLosses += Math.abs(profit); }
        
        holdings = 0;
        position = null;
    }
  }

  // Force close any open positions at the end of backtest
  if (position === 'LONG') {
      const finalPrice = data[data.length - 1].closePrice;
      const profit = (finalPrice - entryPrice) * holdings;
      capital = finalPrice * holdings;
      logs.push({
        id: `#${Math.floor(Math.random()*9000)+1000}`,
        date: chartData[chartData.length-1].date,
        type: 'LONG',
        status: 'CLOSED',
        reason: 'END OF RANGE',
        entry: entryPrice.toFixed(2),
        exit: finalPrice.toFixed(2),
        profit: profit
      });
      if (profit > 0) { winCount++; profitFactorGains += profit; }
      else { lossCount++; profitFactorLosses += Math.abs(profit); }
      // update final equity tick
      chartData[chartData.length - 1].price = capital;
  }

  const netProfit = capital - parseFloat(initialCapital);
  const winRate = (winCount + lossCount) === 0 ? 0 : (winCount / (winCount + lossCount)) * 100;
  const profitFactor = profitFactorLosses === 0 ? (profitFactorGains > 0 ? 999 : 0) : profitFactorGains / profitFactorLosses;
  
  // Sharpe ratio approximation (avg daily return / daily return stddev)
  return {
    initialCapital: parseFloat(initialCapital),
    finalCapital: capital,
    netProfit,
    metrics: {
        winRate: winRate.toFixed(1),
        profitFactor: profitFactor.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(1),
        totalTrades: winCount + lossCount
    },
    logs: logs.reverse(),
    chartData
  };
};
