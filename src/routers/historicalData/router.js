import express from 'express';

import { controller as HistoricalDataController } from './controller.js';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('login page');
  res.send('<h1>Historical Data Router</h1>');
});

router.get('/last30Days/:grp', HistoricalDataController.fetchLast30DaysHistoricalData);

export default router;
