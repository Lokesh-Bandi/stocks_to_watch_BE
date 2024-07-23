import UpstoxClient from 'upstox-js-sdk';

import { getHistoricalData } from '../api/upstoxAPI/apiFuntions.js';
import { TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';
import { insertHistoricalData } from '../models/historicalDataModel.js';
import ApiRateLimiter from '../services/APILimitService.js';
import { getInstrumentalCode, getStockList } from '../utils/utilFuntions.js';

const historicalDataController = {
  fetchGroupHistoricalData: async (req, res) => {
    try {
      const { grp: category, days } = req.params;
      const lastNDays = days ? parseInt(days) : 50;
      const stockList = getStockList(category);
      const upstoxApiInstance = await new UpstoxClient.HistoryApi();

      const executeAPI = async (apiInstance, currentRunningCount) => {
        const stockCode = getInstrumentalCode(stockList[currentRunningCount]);
        const historicalData = await getHistoricalData(stockCode, apiInstance, TIME_INTERVAL.One_Minute, lastNDays);
        await insertHistoricalData(stockList[currentRunningCount], historicalData);
        return historicalData;
      };

      const apiRateLimiterInstance = new ApiRateLimiter(
        upstoxApiInstance,
        executeAPI,
        { maxCallsPerDay: 1000, maxCallsPerMinute: 250, maxCallsPerSecond: 25 },
        NIFTY_500.length
      );

      const { data: rateLimiterResult, message } = await apiRateLimiterInstance.startRateLimiter();

      await rateLimiterResult.forEach(async (stockData, ind) => {
        console.log(stockList[ind]);
      });

      res.send(`Data save sucessfully -- ${message}`);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
  fetchHistoricalData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const instrumentalCode = getInstrumentalCode(stockCode);
    const apiInstance = await new UpstoxClient.HistoryApi();
    const historicalData = await getHistoricalData(instrumentalCode, apiInstance, TIME_INTERVAL.One_Minute, 50);

    // await insertHistoricalData(stockExchangeCode, historicalData); // DB call

    res.send(historicalData);
  },
};

export default historicalDataController;
