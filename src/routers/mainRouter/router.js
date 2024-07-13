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

mainRouter.get('/historicalData/:stockExchangeCode', MainController.fetchLast30DaysStockData);

export default mainRouter;
