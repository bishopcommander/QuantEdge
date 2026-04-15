import React, { createContext, useState, useContext } from 'react';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState('US');

  const getCurrencySymbol = () => {
    switch(region) {
      case '🇮🇳 India': return '₹';
      case '🇪🇺 Europe': return '€';
      case '₿ Crypto': return '₿';
      case '🇺🇸 US':
      default: return '$';
    }
  };

  const formatCurrency = (value) => {
    return `${getCurrencySymbol()}${parseFloat(value).toFixed(2)}`;
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, formatCurrency, getCurrencySymbol }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
