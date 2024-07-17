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

// http://localhost:3000/stock-data/rvnl
// http://localhost:3000/stock-data/rvnl?noOfDays=6
// http://localhost:3000/stock-data/rvnl?noOfDays=4&attributeName=close
// http://localhost:3000/stock-data/rvnl?attributeName=close
router.get(routes.stockCode, stockDataController.fetchStockData);

// http://localhost:3000/stock-data/flatten/yesbank?attributeName=close
// http://localhost:3000/stock-data/flatten/yesbank?noOfDays=2&attributeName=close
router.get(routes.flattenData, stockDataController.fetchStockAttributeFlattenData);

export default router;
