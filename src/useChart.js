// useChart.js
import { useEffect, useRef } from 'react';
import { CandlestickSeries, HistogramSeries, LineSeries, createChart } from 'lightweight-charts';

export const useChart = (candles, volumes, predictions) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const predictionLineSeriesRef = useRef(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 600,
      layout: { backgroundColor: '#ffffff', textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;

    // Candlestick series.
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candleSeries.setData(candles);
    candleSeriesRef.current = candleSeries;

    // Volume series.
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      scaleMargins: { top: 0.9, bottom: 0 },
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.9, bottom: 0 } });
    volumeSeries.setData(volumes);
    volumeSeriesRef.current = volumeSeries;

    // Prediction line series.
    const predictionLineSeries = chart.addSeries(LineSeries, {
      color: '#0000FF',
      lineWidth: 2,
    });
    if (predictions.length > 0) {
      predictionLineSeries.setData(predictions);
    }
    predictionLineSeriesRef.current = predictionLineSeries;

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []); // Run only once on mount.

  // Update chart when data changes.
  useEffect(() => {
    candleSeriesRef.current?.setData(candles);
  }, [candles]);

  useEffect(() => {
    volumeSeriesRef.current?.setData(volumes);
  }, [volumes]);

  useEffect(() => {
    predictionLineSeriesRef.current?.setData(predictions);
  }, [predictions]);

  return chartContainerRef;
};