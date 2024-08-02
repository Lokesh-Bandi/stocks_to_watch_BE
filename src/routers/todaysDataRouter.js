import express from 'express';

import todaysDataController from '../controllers/todaysDataController.js';

const router = express.Router();

const routes = {
  singleStockData: '/:stockExchangeCode',
  lastNDaysFromToday: '/ln/:stockExchangeCode',
  allLastNDaysFromToday: '/ln/all/:grp',
  all: '/all/:grp',
};

router.get('/', (req, res) => {
  res.send('<h1>Todays Data Router</h1>');
});

// http://localhost:3000/today/RVNL
router.get(routes.singleStockData, todaysDataController.fetchTodayData);
// http://localhost:3000/today/ln/RVNL?days=2
router.post(routes.lastNDaysFromToday, todaysDataController.updateLastNDaysFromTodayData);
// http://localhost:3000/today/ln/all/testArray?days=1
router.post(routes.allLastNDaysFromToday, todaysDataController.updateGroupLastNDaysFromTodayData);
// http://localhost:3000/today/all/nifty500
router.get(routes.all, todaysDataController.fetchGroupTodayData);

export default router;
