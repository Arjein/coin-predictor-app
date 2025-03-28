// useChart.js
import { useEffect, useRef } from 'react';
import { CandlestickSeries, HistogramSeries, LineSeries, createChart } from 'lightweight-charts';

export const useChart = (candles, volumes, predictions) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const predictionLineSeriesRef = useRef(null);
  const priceLineRef = useRef(null);

  // Helper function to find current prediction
  const getCurrentPrediction = (predictions, candles) => {
    if (!predictions.length || !candles.length) return null;
    const lastCandle = candles[candles.length - 1];
    return predictions.find(pred => pred.time === lastCandle.time);
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Calculate chart dimensions based on screen size
    const isMobile = window.innerWidth <= 768;
    const chartHeight = isMobile ? window.innerHeight - 100 : window.innerHeight - 70;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d4dc',
        fontSize: isMobile ? 10 : 12,
      },
      grid: {
        vertLines: { color: '#242424' },
        horzLines: { color: '#242424' },
      },
      crosshair: {
        mode: isMobile ? 'magnet' : 'normal',
        vertLine: {
          width: 1,
          color: '#758696',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 3,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#333333',
        rightOffset: isMobile ? 3 : 12,
        barSpacing: isMobile ? 6 : 12,
      },
      rightPriceScale: {
        borderColor: '#333333',
        entireTextOnly: isMobile,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
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
      lastValueVisible: false,
      priceLineVisible: false,


    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.9, bottom: 0 } });
    volumeSeries.setData(volumes);
    volumeSeriesRef.current = volumeSeries;

    // Prediction line series.
    const predictionLineSeries = chart.addSeries(LineSeries, {
      color: '#0000FF',
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Initialize price line only if we have predictions
    if (predictions.length > 0) {
      predictionLineSeries.setData(predictions);
      // Instead of using the last prediction, we use the first one 
      // since it corresponds to the current streaming kline
      const currentPrediction = predictions[0];
      const priceLine = {
        price: currentPrediction.value,
        color: '#3179F5',
        lineWidth: 2,
        lineStyle: 2, // LineStyle.Dashed
        axisLabelVisible: true,
        title: 'Current Prediction',
      };
      priceLineRef.current = predictionLineSeries.createPriceLine(priceLine);
    }
    predictionLineSeriesRef.current = predictionLineSeries;

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const newHeight = isMobile ? window.innerHeight - 100 : window.innerHeight - 70;
      
      chart.applyOptions({ 
        width: container.clientWidth,
        height: newHeight,
        layout: {
          fontSize: isMobile ? 10 : 12,
        },
        timeScale: {
          rightOffset: isMobile ? 3 : 12,
          barSpacing: isMobile ? 6 : 12,
        },
      });
    };

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

  // Update price line when predictions or candles change
  useEffect(() => {
    if (predictions.length > 0 && predictionLineSeriesRef.current && candles.length > 0) {
      predictionLineSeriesRef.current.setData(predictions);
      
      const currentPrediction = getCurrentPrediction(predictions, candles);
      if (currentPrediction && predictionLineSeriesRef.current) {
        if (priceLineRef.current) {
          priceLineRef.current.applyOptions({
            price: currentPrediction.value,
            title: `Prediction: ${currentPrediction.value.toFixed(2)}`,
          });
        } else {
          const priceLine = {
            price: currentPrediction.value,
            color: '#3179F5',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Prediction: ${currentPrediction.value.toFixed(2)}`,
          };
          priceLineRef.current = predictionLineSeriesRef.current.createPriceLine(priceLine);
        }
      }
    }
  }, [predictions, candles]);

  return chartContainerRef;
};