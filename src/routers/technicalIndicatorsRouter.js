import express from 'express';

import technicalIndicatorsController from '../controllers/technicalIndicatorsController.js';

const router = express.Router();

const routes = {
  stockCode: '/:stockExchangeCode',
  singleDBUpdate: '/one/:stockExchangeCode',
  allDBUpdate: '/all/:grp',
};

router.get('/', (req, res) => {
  res.send('<h1>Technical Analysis Router</h1>');
});

// http://localhost:3000/ta/RVNL?ti=rsi&interval=4hour
router.get(routes.stockCode, technicalIndicatorsController.fetchTechnicalIndicatorValue);
// http://localhost:3000/ta/one/RVNL?ti=mfi
router.get(routes.singleDBUpdate, technicalIndicatorsController.updateCustomTIValueForSingleStock);
// http://localhost:3000/ta/all/nifty500?ti=mfi
router.get(routes.allDBUpdate, technicalIndicatorsController.updateGroupCustomTIValue);

export default router;
