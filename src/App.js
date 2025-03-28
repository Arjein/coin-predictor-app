// App.js
import React from 'react';
import TradingViewLightweightChart from './TradingViewLightweightChart';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>BNB/USDT Price Prediction</h1>
      </header>
      <main className="chart-container">
        <div className="chart-info">
          <div>Live Price Updates</div>
          <div>AI Predictions Enabled</div>
        </div>
        <div className="chart-wrapper">
          <TradingViewLightweightChart />
        </div>
      </main>
    </div>
  );
}

export default App;