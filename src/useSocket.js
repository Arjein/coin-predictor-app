// useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import { timeToLocal } from './utils';

export const useSocket = (endpoint, onNewCandle) => {
  useEffect(() => {
    const socket = io(endpoint, {
      transports: ['websocket'],
      secure: true,
    });
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    socket.on('kline_update', (data) => {
      console.log('📈 Kline update:', data);
      const newCandle = {
        time: timeToLocal(Math.floor(data.open_time / 1000)),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        close: parseFloat(data.close),
      };
      onNewCandle(newCandle);
    });

    return () => {
      socket.disconnect();
    };
  }, [endpoint, onNewCandle]);
};