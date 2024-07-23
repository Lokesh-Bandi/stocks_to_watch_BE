import express from 'express';

import technicalIndicatorsController from '../controllers/technicalIndicatorsController.js';

const router = express.Router();

const routes = {
  stockCode: '/:stockExchangeCode',
  all: '/all/:grp',
};

router.get('/', (req, res) => {
  res.send('<h1>Technical Analysis Router</h1>');
});

router.get(routes.stockCode, technicalIndicatorsController.fetchTechnicalIndicatorValue);
router.get(routes.all, technicalIndicatorsController.updateGroupCustomTIValue);

export default router;
