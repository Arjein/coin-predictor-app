# Coin Predictor App

A real-time cryptocurrency price prediction application that displays live BNB/USDT price data with AI-powered price forecasts.

![Coin Predictor Screenshot](screenshot.png)

## Live Demo

Check out the live application: [https://coin-predictor-app.vercel.app/](https://coin-predictor-app.vercel.app/)

## Features

- 📊 Real-time candlestick chart for BNB/USDT
- 📈 Live price updates via WebSocket connection
- 🤖 AI-generated price predictions
- 📱 Responsive design that works on both desktop and mobile
- 📊 Volume indicators with color coding
- 📍 Dynamic price lines for current predictions

## Tech Stack

- **Frontend:** React.js
- **Charting Library:** Lightweight Charts by TradingView
- **Real-time Data:** Socket.IO
- **API:** Custom backend deployed on Railway
- **AI Model:** Hugging Face Spaces

## System Architecture

The system consists of three main components:

1. **Frontend Application** (current repository)
   - Deployed on Vercel
   - Provides interactive UI for viewing price data and predictions

2. **Backend API** ([coin-predictor-api](https://github.com/Arjein/coin-predictor-api))
   - Deployed on Railway
   - Handles data storage, WebSocket connections, and communication with AI model
   - Fetches market data from cryptocurrency exchanges

3. **AI Prediction Model**
   - Hosted on [Hugging Face Spaces](https://huggingface.co/spaces/Arjein/coin-predictor)
   - Built with TinyTimeMixer architecture (based on IBM Granite TimeSeries TTM R2)
   - Uses 512 time steps of historical data to predict 48 future price points
   - Incorporates technical indicators (EMA, RSI, ATR), market sentiment (Fear & Greed Index), and temporal features
   - Fine-tuned specifically for BNB/USDT 5-minute price movements 
   - Exposes a FastAPI endpoint for real-time prediction requests

Data flows through the system as follows:
- The backend collects market data and sends it to the frontend
- The backend periodically sends historical data to the AI model for predictions
- Predictions are stored in the backend database and served to the frontend
- Real-time price updates are pushed to the frontend via WebSockets

## Deployment

The application is deployed on Vercel:
- **Production URL:** [https://coin-predictor-app.vercel.app/](https://coin-predictor-app.vercel.app/)
- **Deployment Platform:** Vercel
- **CI/CD:** Automatic deployments from the main branch

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/coin-predictor-app.git
   cd coin-predictor-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Architecture

The application uses several custom React hooks:

- `useFetchCandles`: Fetches historical candlestick data
- `useFetchForecasts`: Retrieves AI-generated price predictions
- `useSocket`: Establishes WebSocket connection for real-time updates
- `useChart`: Manages the TradingView Lightweight Chart

## API Endpoints

The application connects to the following API endpoints:

- `GET /candles`: Retrieves historical candlestick data
- `GET /forecasts`: Fetches AI-generated price predictions
- WebSocket: Listens for `kline_update` events for real-time price data

All API requests are sent to the backend service at: `https://coin-predictor-api-production.up.railway.app`

## Configuration

The backend API endpoint is configured in `TradingViewLightweightChart.jsx`:
```javascript
const railwayEndpoint = 'https://coin-predictor-api-production.up.railway.app';
```

## License

MIT
