// useFetchForecasts.js
import { useState, useEffect } from 'react';
import { timeToLocal } from './utils';

export const useFetchForecasts = (endpoint) => {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const response = await fetch(`${endpoint}/forecasts`);
        const data = await response.json();
        console.log('Forecast data:', data);
        const mappedForecasts = data.map(item => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          value: item.close,
        }));
        setPredictions(mappedForecasts);
      } catch (error) {
        console.error('Error fetching forecasts:', error);
      }
    };

    fetchForecasts();
  }, [endpoint]);

  return predictions;
};