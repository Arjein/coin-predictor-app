// useFetchCandles.js
import { useState, useEffect } from 'react';
import { timeToLocal } from './utils';

export const useFetchCandles = (endpoint) => {
  const [candles, setCandles] = useState([]);
  const [volumes, setVolumes] = useState([]);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        const response = await fetch(`${endpoint}/candles`);
        const data = await response.json();
        console.log('Historical data:', data);
        const mappedCandles = data.map(item => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
        const mappedVolumes = data.map(item => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          value: item.volume,
          color: item.close < item.open ? '#ef5350' : '#26a69a'
        }));
        setCandles(mappedCandles);
        setVolumes(mappedVolumes);
      } catch (error) {
        console.error('Error fetching candles:', error);
      }
    };

    fetchCandles();
  }, [endpoint]);

  return { candles, volumes, setCandles };
};