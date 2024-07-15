import { TIME_INTERVAL } from '../constants/appConstants.js';
import modal from '../models/modal.js';
import { getRSI } from '../utils/talib.js';

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
    const stockName = req.params.st;
    const rsiValues = await getRSI(stockName, TIME_INTERVAL.One_Day);
    res.send(rsiValues);
  },
};

export default mainController;
