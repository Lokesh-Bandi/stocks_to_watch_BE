import express from 'express';

import todaysDataController from '../controllers/todaysDataController.js';

const router = express.Router();

const routes = {
  singleStockData: '/:stockExchangeCode',
  all: '/all/:grp',
};

router.get('/', (req, res) => {
  res.send('<h1>Todays Data Router</h1>');
});

router.get(routes.singleStockData, todaysDataController.fetchTodayData);
router.get(routes.all, todaysDataController.fetchGroupTodayData);

export default router;
