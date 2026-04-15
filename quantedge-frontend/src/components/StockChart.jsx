import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useRegion } from '../context/RegionContext.jsx';

const StockChart = ({ symbol, data, type = 'area', color = '#10B981', interactive = false }) => {
  const { getCurrencySymbol } = useRegion();
  // Parse data and handle potential dates instead of just indexes
  const chartData = data && data.length > 0 
    ? data.map((d, i) => {
        let xVal = i;
        if (d.date) {
            // Check if string could be parsed as a time or simple label
            const parsed = new Date(d.date).getTime();
            xVal = isNaN(parsed) ? d.date : parsed; // fallback to string if not standard date
        }
        return { x: xVal, y: typeof d === 'number' ? d : (d.price || 0) };
    })
    : [100, 110, 105, 125, 140, 130, 160].map((y, i) => ({ x: i, y }));

  const options = {
    chart: {
      type: type,
      background: 'transparent',
      toolbar: { show: interactive },
      sparkline: { enabled: !interactive }
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'straight', width: interactive ? 2 : 2 },
    colors: [color],
    fill: {
      type: 'solid',
      opacity: 0.1
    },
    tooltip: { 
      enabled: interactive,
      theme: 'dark'
    },
    grid: { 
      show: interactive,
      borderColor: '#2d2d2d',
      strokeDashArray: 3
    },
    xaxis: { 
      type: interactive && chartData[0]?.x && typeof chartData[0].x === 'number' && chartData[0].x > 10000 ? 'datetime' : 'category',
      labels: { show: interactive, style: { colors: '#9ca3af' } },
      axisBorder: { show: interactive, color: '#2d2d2d' },
      axisTicks: { show: interactive, color: '#2d2d2d' },
      tooltip: { enabled: false }
    },
    yaxis: { 
      show: interactive,
      labels: { 
        style: { colors: '#9ca3af' },
        formatter: (val) => `${getCurrencySymbol()}${val.toFixed(2)}`
      } 
    },
    dataLabels: { enabled: false }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactApexChart options={options} series={[{ name: symbol || 'Asset', data: chartData }]} type={type} height="100%" />
    </div>
  );
};

export default StockChart;
