import React, { useState, useRef, useEffect } from 'react';
import { CandlestickSeries, HistogramSeries, LineSeries, createChart } from 'lightweight-charts';
import io from 'socket.io-client';

const TradingViewLightweightChart = ({ historicalData = [] }) => {
  const [candles, setCandles] = useState(historicalData);
  const [volumes, setVolumes] = useState(historicalData);
  const [predictions, setPredictions] = useState([]);

  const chartContainerRef = useRef(null);
  const chartRef = useRef();
  const candleSeriesRef = useRef();
  const volumeSeriesRef = useRef();
  const predictionLineSeriesRef = useRef();

  function timeToLocal(originalTime) {
    const d = new Date(originalTime * 1000);
    return Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000;
  }

  // Fetch historical candles and volume from the API on mount.
  useEffect(() => {
    fetch('http://localhost:5001/candles')
      .then((response) => response.json())
      .then((data) => {
        console.log('Historical data:', data);
        // Map candle data (assuming timestamps are in ms).
        const mappedData = data.map(item => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
        // Map volume data.
        const histVolumeData = data.map(item => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          value: item.volume,  // note: HistogramSeries expects 'value'
          color: item.close < item.open ? '#ef5350' : '#26a69a'
        }));
        setCandles(mappedData);
        setVolumes(histVolumeData);
      })
      .catch((error) => console.error('Error fetching candles:', error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5001/forecasts')
      .then((response) => response.json())
      .then((data) => {
        console.log('Forecast data:', data);
        // Map each forecast object into { time, value }.
        // Adjust the field names if necessary.
        const mappedForecasts = data.map((item) => ({
          time: timeToLocal(Math.floor(item.time / 1000)),
          value: item.close
          // open: item.open,
          // high: item.high,
          // low: item.low,
          // close: item.close,
        }));
        setPredictions(mappedForecasts);
      })
      .catch((error) => console.error('Error fetching forecasts:', error));
  }, []);

  // Create the chart once when component mounts.
  useEffect(() => {
    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 600,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chartRef.current = chart;

    // Add candlestick series.
    const candleSeries = chart.addSeries(CandlestickSeries,{
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candleSeries.setData(candles);
    candleSeriesRef.current = candleSeries;

    // Add volume (histogram) series.
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',

      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume', // Overlay on main chart.
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
          top: 0.9, // highest point of the series will be 70% away from the top
          bottom: 0,
      },
  });
    
    volumeSeries.setData(volumes);
    volumeSeriesRef.current = volumeSeries;

    const predictionLineSeries = chart.addSeries(LineSeries,{
      color: '#0000FF',  // Blue color for the prediction line
      
      lineWidth: 2,
      
    });
    // const predictionLineSeries = chart.addSeries(CandlestickSeries,{

    //   upColor: '#00A7E1',
    //   downColor: '#FFA630',
    //   borderVisible: false,
    //   wickUpColor: '#00A7E1',
    //   wickDownColor: '#FFA630',
  
    //   });
    

      // If predictions are already fetched, set the data
    if (predictions.length > 0) {
      predictionLineSeries.setData(predictions);
    }
    predictionLineSeriesRef.current = predictionLineSeries;

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []); // run only on mount

  // Update the candle series when candles state changes.
  useEffect(() => {
    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(candles);
    }
  }, [candles]);

  // Update the volume series when volumes state changes.
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumes);
    }
  }, [volumes]);

  useEffect(() => {
    if (predictionLineSeriesRef.current) {
      predictionLineSeriesRef.current.setData(predictions);
    }
  }, [predictions]);

  // Socket.IO real-time updates (candle updates).
  useEffect(() => {
    const socket = io('http://localhost:5001/');
    
    socket.on('kline_update', (data) => {
      console.log('Received Kline:', JSON.stringify(data, null, 2));

      const newCandle = {
        time: timeToLocal(Math.floor(data.open_time / 1000)),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        close: parseFloat(data.close),
      };

      setCandles((prevCandles) => {
        if (prevCandles.length === 0) {
          return [newCandle];
        }
        const lastCandle = prevCandles[prevCandles.length - 1];
        if (lastCandle.time === newCandle.time) {
          return [...prevCandles.slice(0, -1), newCandle];
        } else {
          return [...prevCandles, newCandle];
        }
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: 'relative', width: '100%', height: '600px' }}
    />
  );
};

export default TradingViewLightweightChart;