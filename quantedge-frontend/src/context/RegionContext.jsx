import React, { createContext, useState, useContext, useEffect } from 'react';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState('US');
  const [rates, setRates] = useState({ INR: 83.5, EUR: 0.92, BTC: 0.000015 }); // defaults

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        
        // Fetch BTC rate separately from coindesk or approximate from er-api if unavailable
        let btcRate = rates.BTC;
        try {
            const btcRes = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const btcData = await btcRes.json();
            if(btcData?.bpi?.USD?.rate_float) {
                btcRate = 1 / btcData.bpi.USD.rate_float;
            }
        } catch (e) {
            console.error("Failed BTC fetch", e);
        }

        if (data && data.rates) {
          setRates({
            INR: data.rates.INR || 83.5,
            EUR: data.rates.EUR || 0.92,
            BTC: btcRate
          });
        }
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
      }
    };
    fetchRates();
  }, []);

  const getCurrencySymbol = () => {
    switch(region) {
      case 'India': 
      case '🇮🇳 India': 
        return '₹';
      case 'Europe': 
      case '🇪🇺 Europe': 
        return '€';
      case 'Crypto': 
      case '₿ Crypto': 
        return '₿';
      case 'US':
      case '🇺🇸 US':
      default: 
        return '$';
    }
  };

  const getExchangeRate = () => {
    switch(region) {
      case 'India': 
      case '🇮🇳 India': 
        return rates.INR;
      case 'Europe': 
      case '🇪🇺 Europe': 
        return rates.EUR;
      case 'Crypto': 
      case '₿ Crypto': 
        return rates.BTC;
      case 'US':
      case '🇺🇸 US':
      default: 
        return 1;
    }
  };

  const formatCurrency = (value) => {
    const symbol = getCurrencySymbol();
    let convertedValue = parseFloat(value) * getExchangeRate();
    
    // For Crypto (Bitcoin), show more decimal places as quantities are small
    if (symbol === '₿') {
        return `${symbol}${convertedValue.toFixed(6)}`;
    }
    
    // For large INR amounts, format with commas nicely (Indian style)
    if (symbol === '₹') {
        return `${symbol}${convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
    }

    return `${symbol}${convertedValue.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, formatCurrency, getCurrencySymbol }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
