import UpstoxClient from 'upstox-js-sdk';

import { getTodayData } from '../api/upstoxAPI/apiFuntions.js';
import { TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';
import { fetchCustomDataValues } from '../database/utils/dbHelper.js';
import { insertHistoricalData } from '../models/historicalDataModel.js';
import ApiRateLimiter from '../services/APILimitService.js';
import { getInstrumentalCode, getStcokList } from '../utils/utilFuntions.js';

const todaysDataController = {
  fetchGroupTodayData: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStcokList(category);
      const upstoxApiInstance = await new UpstoxClient.HistoryApi();

      const executeAPI = async (apiInstance, currentRunningCount) => {
        const stockCode = getInstrumentalCode(stockList[currentRunningCount]);
        const todayData = await getTodayData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);
        return todayData;
      };

      const apiRateLimiterInstance = new ApiRateLimiter(
        upstoxApiInstance,
        executeAPI,
        { maxCallsPerHour: 1000, maxCallsPerMinute: 250, maxCallsPerSecond: 25 },
        NIFTY_500.length
      );

      const { data: rateLimiterResult, message } = await apiRateLimiterInstance.startRateLimiter();

      await rateLimiterResult.forEach(async (stockData, ind) => {
        await insertHistoricalData(stockList[ind], stockData);
      });

      res.send(`Data save sucessfully -- ${message}`);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
  fetchTodayData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = getInstrumentalCode(stockExchangeCode);
    const apiInstance = await new UpstoxClient.HistoryApi();
    const todayData = await getTodayData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);

    res.send(todayData);
  },
  fetchCustomData: async (req, res) => {
    const { stockExchangeCode, customParam } = req.params;
    const responseData = await fetchCustomDataValues(stockExchangeCode, customParam, 2);
    res.send(responseData);
  },
};

export default todaysDataController;
