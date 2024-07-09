import { STOCK_SYMBOLS } from '../../constants/constants.js';
import ApiRateLimiter from '../../services/APILimitService.js';

import modal from './modal.js';

const controller = {
  fetchDataTest: async (req, res) => {
    console.log('Main Router');
    try {
      const data = await modal.getJsonData();
      res.send(data);
    } catch (error) {
      res.status(404);
    }
  },
  fetchHistoricalData: async (req, res) => {
    console.log('Main Router --- Historical Data', STOCK_SYMBOLS[0]);
    try {
      const data = await globalThis.breezeInstance.getHistoricalData({
        interval: '1day', // '1minute', '5minute', '30minute','1day'
        fromDate: '2024-06-21T07:00:00.000Z',
        toDate: '2024-06-25T07:00:00.000Z',
        stockCode: STOCK_SYMBOLS[0],
        exchangeCode: 'NSE', // 'NSE','BSE','NFO'
        productType: 'cash',
      });
      res.send(data);
    } catch (error) {
      res.send('Error in acessing ');
      res.status(404);
    }
  },
  fetchStockCodes: async (req, res) => {
    const allStockCodes = {};
    const executorCallback = () => {
      const stockSymbols = STOCK_SYMBOLS;

      const getStockCode = async (currentApiCallcount) => {
        console.log(currentApiCallcount);
        const code = await globalThis.breezeInstance.getNames({
          exchangeCode: 'NSE',
          stockCode: stockSymbols[currentApiCallcount],
        });
        console.log(code);
        allStockCodes[stockSymbols[currentApiCallcount]] = code;
      };
      return getStockCode;
    };

    const executeAPI = executorCallback();
    const manualStopCount = 2379;

    const apiRateLimiterInstance = new ApiRateLimiter(
      executeAPI,
      manualStopCount,
      {
        maxCallsPerMinute: 100,
        maxCallsPerDay: 5000,
      }
    );
    apiRateLimiterInstance.startRateLimiter();

    const timeToPrint = 1000 * 60 * 24;
    setTimeout(() => {
      console.log(allStockCodes);
      res.send(allStockCodes);
    }, timeToPrint);
  },
};
export default controller;
