import express from 'express';

import uiController from '../controllers/uiController.js';

const router = express.Router();

const routes = {
  ti_all: '/ti',
  coreData: '/core-data',
  keyStocks: '/key-stocks',
  momentumStocks: '/momentum-stocks',
};

router.get('/', (req, res) => {
  res.send('<h1>UI Router</h1>');
});

// http://localhost:3000/ui/ti?ti=mfi
// http://localhost:3000/ui/ti?ti=rsi
router.get(routes.ti_all, uiController.fetchConsolidatedTechnicalIdicatorValues);
// http://localhost:3000/ui/key-stocks
router.get(routes.keyStocks, uiController.fetchAllKeyStocks);
// http://localhost:3000/ui/core-data
router.get(routes.coreData, uiController.fetchCoreDataForAllStocks);
router.get(routes.momentumStocks, uiController.fetchMomentumStocks);

export default router;
