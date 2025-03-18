// subscribe.js
const io = require('socket.io-client');

// Connect to your backend
const socket = io('http://192.168.1.103:5001');

socket.on('connect', () => {
  console.log('Connected to Socket.IO server!');
});

socket.on('kline_update', (data) => {
  console.log('Received kline update:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});