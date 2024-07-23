import express from 'express';

import technicalIndicatorsController from '../controllers/technicalIndicatorsController.js';

const router = express.Router();

const routes = {
  stockCode: '/:stockExchangeCode',
  test: '/test/:grp',
};

router.get('/', (req, res) => {
  res.send('<h1>Technical Analysis Router</h1>');
});

router.get(routes.stockCode, technicalIndicatorsController.fetchTechnicalIndicatorValue);
router.get(routes.test, technicalIndicatorsController.updateGroupCustomTIValue);

export default router;
