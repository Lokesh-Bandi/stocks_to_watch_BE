import express from 'express';

import historicalDataController from '../controllers/historicalDataController.js';

import { SUB_ROUTES } from './routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('<h1>Historical Data Router</h1>');
});

router.get(SUB_ROUTES.history.singleStockData, historicalDataController.fetchHistoricalData);
router.get(SUB_ROUTES.history.all, historicalDataController.fetchGroupHistoricalData);

export default router;
