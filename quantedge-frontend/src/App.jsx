import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/DashboardLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Portfolio from './pages/Portfolio.jsx';
import MarketData from './pages/MarketData.jsx';
import Backtester from './pages/Backtester.jsx';
import AiPrediction from './pages/AiPrediction.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import './index.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Authenticated / App Routes wrapped in ProtectedRoute -> DashboardLayout */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* The empty path exactly matches "/app" */}
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="market" element={<MarketData />} />
          <Route path="backtest" element={<Backtester />} />
          <Route path="ai-oracle" element={<AiPrediction />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
