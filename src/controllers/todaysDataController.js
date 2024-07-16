import UpstoxClient from 'upstox-js-sdk';

import { getTodayData } from '../api/upstoxAPI/apiFuntions.js';
import { ERROR_MESSAGE, TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';
import { fetchCustomDataValues, isDataAvailableForThisDate } from '../database/utils/dbHelper.js';
import { insertTodayData } from '../models/todaysDataModel.js';
import ApiRateLimiter from '../services/APILimitService.js';
import { getInstrumentalCode, getStcokList } from '../utils/utilFuntions.js';

const todaysDataController = {
  fetchGroupTodayData: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStcokList(category);

      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }

      const upstoxApiInstance = await new UpstoxClient.HistoryApi();

      const executeAPI = async (apiInstance, currentRunningCount) => {
        const stockCode = getInstrumentalCode(stockList[currentRunningCount]);
        const todayData = await getTodayData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);
        if (todayData.length === 0) return null;

        const isDataAvailable = await isDataAvailableForThisDate(stockList[currentRunningCount], todayData[0]?.date);
        if (isDataAvailable) {
          return null;
        }

        await insertTodayData(stockList[currentRunningCount], todayData);
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
        console.log(stockList[ind]);
      });

      res.send(`Data save sucessfully -- ${message}`);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
  fetchTodayData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = getInstrumentalCode(stockExchangeCode);

    if (!stockCode) {
      res.send(ERROR_MESSAGE.unknownStockCode);
    }
    const apiInstance = await new UpstoxClient.HistoryApi();
    const todayData = await getTodayData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);
    if (todayData.length === 0) return null;
    if (isDataAvailableForThisDate(stockExchangeCode, todayData[0]?.date)) {
      return res.status(200).send(ERROR_MESSAGE.dataAvaiableForTheDate);
    }

    await insertTodayData(stockExchangeCode, todayData);
    res.send(todayData);
  },
  fetchCustomData: async (req, res) => {
    const { stockExchangeCode, customParam } = req.params;
    const responseData = await fetchCustomDataValues(stockExchangeCode, customParam, 2);
    res.send(responseData);
  },
};

export default todaysDataController;
