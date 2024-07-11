import express from 'express';

import { connectBreeze } from '../../api/breezeAPI/breezeConnect.js';
import ROUTES from '../constants.js';
import loginRouter from '../login/router.js';
import signUpRouter from '../signup/router.js';

import MainController from './controller.js';

const mainRouter = express.Router();

mainRouter.use(`/${ROUTES.login}`, loginRouter);
mainRouter.use(`/${ROUTES.signUp}`, signUpRouter);

mainRouter.use('/', async (req, res, next) => {
  if (!global.breezeInstance) {
    await connectBreeze();
    await MainController.fetchCustomerDetails();
  }
  next();
});

mainRouter.get('/oneClickFO', MainController.fetchOneClickFO);

mainRouter.get('/stockLiveFeed', MainController.fetchStockLiveFeed);

mainRouter.get('/historicalData/:stockName', async (req, res) => {
  const { stockName } = req.params;
  const stockData = await MainController.fetchLast30DaysStockData(stockName);
  res.send(stockData);
});

mainRouter.get('/todaysData/:stockName', async (req, res) => {
  const { stockName } = req.params;
  const stockData = await MainController.fetchTodaysData(stockName);
  res.send(stockData);
});

mainRouter.get('/test', MainController.test);


// Fetch Stock Codes
// mainRouter.get('/stock-codes', MainController.fetchStockCodes);

export default mainRouter;
