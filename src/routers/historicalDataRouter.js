import express from 'express';

import historicalDataController from '../controllers/historicalDataController.js';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('login page');
  res.send('<h1>Historical Data Router</h1>');
});

router.get('/:stockExchangeCode', historicalDataController.fetchHistoricalData);
router.get('/lastndays/:grp/:days', historicalDataController.fetchGroupHistoricalData);

export default router;
