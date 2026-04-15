export const regionalTickers = {
  'US': ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'META'],
  'India': ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBI', 'WIPRO'],
  'Europe': ['SAP', 'ASML', 'LVMH', 'SIE', 'NOVOB', 'SAN', 'MC'],
  'Crypto': ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT']
};

export const getTickersForRegion = (region) => {
  return regionalTickers[region] || regionalTickers['US'];
};
