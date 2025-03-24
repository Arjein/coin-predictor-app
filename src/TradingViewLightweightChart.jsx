import React, { useState, useCallback } from 'react';
import { useFetchCandles } from './useFetchCandles';
import { useFetchForecasts } from './useFetchForecasts';
import { useChart } from './useChart';
import { useSocket } from './useSocket';

const TradingViewLightweightChart = ({ historicalData = [] }) => {
  const railwayEndpoint = 'https://coin-predictor-api-production.up.railway.app';
  const { candles, volumes, setCandles } = useFetchCandles(railwayEndpoint);
  const predictions = useFetchForecasts(railwayEndpoint);
  const chartContainerRef = useChart(candles, volumes, predictions);

  // Callback to handle new candle data from the socket.
  const handleNewCandle = useCallback((newCandle) => {
    setCandles(prevCandles => {
      if (prevCandles.length === 0) return [newCandle];
      const lastCandle = prevCandles[prevCandles.length - 1];
      if (lastCandle.time === newCandle.time) {
        return [...prevCandles.slice(0, -1), newCandle];
      } else {
        return [...prevCandles, newCandle];
      }
    });
  }, [setCandles]);

  useSocket(railwayEndpoint, handleNewCandle);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: 'relative', width: '100%', height: '600px' }}
    />
  );
};

export default TradingViewLightweightChart;