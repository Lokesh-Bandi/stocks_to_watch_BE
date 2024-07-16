import express from 'express';

import todaysDataController from '../controllers/todaysDataController.js';

import { SUB_ROUTES } from './routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('<h1>Todays Data Router</h1>');
});

router.get(SUB_ROUTES.today.singleStockData, todaysDataController.fetchTodayData);
router.get(SUB_ROUTES.today.all, todaysDataController.fetchGroupTodayData);
router.get(SUB_ROUTES.today.customData, todaysDataController.fetchCustomData);

export default router;
