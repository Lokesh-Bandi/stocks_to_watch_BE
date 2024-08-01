import { TIME_INTERVAL } from '../constants/appConstants.js';
import modal from '../models/modal.js';
import { calculateRSI } from '../utils/talib.js';

const mainController = {
  fetchDataTest: async (req, res) => {
    console.log('Main Router');
    try {
      const data = await modal.getJsonData();
      res.send(data);
    } catch (error) {
      res.status(404);
    }
  },
  test: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const rsiValues = await calculateRSI(stockCode, TIME_INTERVAL.One_Day);
    res.send(rsiValues);
  },
};

export default mainController;
