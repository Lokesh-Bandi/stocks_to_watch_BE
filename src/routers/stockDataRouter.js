import express from 'express';

import stockDataController from '../controllers/stockDataController.js';

const router = express.Router();

const routes = {
  stockCode: '/:stockExchangeCode',
  flattenData: '/flatten/:stockExchangeCode',
};

router.get('/', (req, res) => {
  res.send('<h1>Stock Data Router</h1>');
});

router.get(routes.stockCode, stockDataController.fetchStockAttributeData);
router.get(routes.flattenData, stockDataController.fetchStockAttributeFlattenData);

export default router;
