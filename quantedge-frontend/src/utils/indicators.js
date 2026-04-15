// Utility functions for calculating technical indicators

export const calculateSMA = (data, period, key = 'closePrice') => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][key];
    }
    result.push(sum / period);
  }
  return result;
};

export const calculateRSI = (data, period = 14, key = 'closePrice') => {
  const result = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    
    const change = data[i][key] - data[i - 1][key];
    
    if (i < period) {
      if (change > 0) gains += change;
      else losses -= change;
      result.push(null);
      if (i === period - 1) {
        gains /= period;
        losses /= period;
        const rs = gains / (losses === 0 ? 1 : losses);
        result[i] = 100 - (100 / (1 + rs));
      }
    } else {
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
      const rs = gains / (losses === 0 ? 1 : losses);
      result.push(100 - (100 / (1 + rs)));
    }
  }
  return result;
};

export const calculateEMA = (data, period, key = 'closePrice') => {
  const result = [];
  const multiplier = 2 / (period + 1);
  let ema = null;

  for (let i = 0; i < data.length; i++) {
    const price = typeof data[i] === 'number' ? data[i] : data[i][key];
    if (i < period - 1) {
        result.push(null);
        continue;
    }
    if (i === period - 1) {
        // Calculate SMA for the first EMA value
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += typeof data[i-j] === 'number' ? data[i-j] : data[i-j][key];
        }
        ema = sum / period;
        result.push(ema);
    } else {
        ema = (price - ema) * multiplier + ema;
        result.push(ema);
    }
  }
  return result;
};

export const calculateMACD = (data, fast = 12, slow = 26, signalPeriod = 9, key = 'closePrice') => {
  const fastEMA = calculateEMA(data, fast, key);
  const slowEMA = calculateEMA(data, slow, key);
  
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Need to extract non-null values for the signal line EMA
  const validMacdLine = macdLine.filter(val => val !== null);
  const macdObjects = validMacdLine.map(v => ({ val: v }));
  const signalEMA = calculateEMA(macdObjects, signalPeriod, 'val');
  
  const result = [];
  let signalIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === null) {
        result.push({ macd: null, signal: null, histogram: null });
    } else {
        const sig = signalEMA[signalIdx];
        result.push({
            macd: macdLine[i],
            signal: sig,
            histogram: sig !== null ? macdLine[i] - sig : null
        });
        signalIdx++;
    }
  }
  return result;
};

export const calculateBollingerBands = (data, period = 20, stdDev = 2.0, key = 'closePrice') => {
  const sma = calculateSMA(data, period, key);
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ upper: null, middle: null, lower: null });
      continue;
    }

    let varianceSum = 0;
    const currentSma = sma[i];
    for (let j = 0; j < period; j++) {
      const price = data[i - j][key];
      varianceSum += Math.pow(price - currentSma, 2);
    }
    const standardDeviation = Math.sqrt(varianceSum / period);

    result.push({
      upper: currentSma + (standardDeviation * stdDev),
      middle: currentSma,
      lower: currentSma - (standardDeviation * stdDev)
    });
  }
  return result;
};
