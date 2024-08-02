import express from 'express';

import historicalDataController from '../controllers/historicalDataController.js';

const router = express.Router();

const routes = {
  singleStockData: '/:stockExchangeCode',
  all: '/all/:grp/:days',
  forParticularDate: '/date/:stockExchangeCode',
};

router.get('/', (req, res) => {
  res.send('<h1>Historical Data Router</h1>');
});

// http://localhost:3000/historicalData/RVNL
router.post(routes.singleStockData, historicalDataController.fetchHistoricalData);
// http://localhost:3000/historicalData/all/nifty500/50
router.post(routes.all, historicalDataController.fetchGroupHistoricalData);
// http://localhost:3000/historicalData/date/RVNL?&date=2024-07-22
router.get(routes.forParticularDate, historicalDataController.fetchHistoricalDataForParticularDate);

export default router;
