import express from 'express';

import ROUTES from '../constants.js';
import historicalDataRouter from '../historicalData/router.js';
import testRouter from '../test/router.js';

import { controller as MainController } from './controller.js';

const mainRouter = express.Router();

mainRouter.use(`/${ROUTES.historicalData}`, historicalDataRouter);
mainRouter.use(`/${ROUTES.test}`, testRouter);

mainRouter.get('/', (req, res) => {
  res.send('Welcome to the server!!');
});

mainRouter.get(
  '/historicalData/:stockExchangeCode',
  MainController.fetchLast30DaysStockData
);

mainRouter.get('/todaysData/:stockName', async (req, res) => {
  const { stockName } = req.params;
  const stockData = await MainController.fetchTodaysData(stockName);
  res.send(stockData);
});

// Fetch Stock Codes
// mainRouter.get('/stock-codes', MainController.fetchStockCodes);

export default mainRouter;
