import UpstoxClient from 'upstox-js-sdk';

import { getHistoricalData, getHistoricalDataForParticularDate } from '../api/upstoxAPI/apiFuntions.js';
import { ERROR_MESSAGE, TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';
import { fetchInstrumentalCodeForSpecificStockDB, fetchInstrumentalCodesDB } from '../database/utils/dbHelper.js';
import { insertHistoricalData } from '../models/historicalDataModel.js';
import ApiRateLimiter from '../services/APILimitService.js';
import { getStockList } from '../utils/utilFuntions.js';

const historicalDataController = {
  fetchGroupHistoricalData: async (req, res) => {
    try {
      const { grp: category, days } = req.params;
      const lastNDays = days ? parseInt(days) : 50;
      const stockList = getStockList(category);
      const upstoxApiInstance = await new UpstoxClient.HistoryApi();
      const instrumentalCodes = await fetchInstrumentalCodesDB();
      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }
      if (!instrumentalCodes) {
        res.send(ERROR_MESSAGE.noInstrumentalCodes);
        return;
      }
      const executeAPI = async (apiInstance, currentRunningCount) => {
        const instrumentalCode = instrumentalCodes[stockList[currentRunningCount]];
        const { status: apiStatus, data: historicalData } = await getHistoricalData(
          instrumentalCode,
          apiInstance,
          TIME_INTERVAL.One_Minute,
          lastNDays
        );
        const { status: dbStatus, ack } = await insertHistoricalData(stockList[currentRunningCount], instrumentalCode, historicalData);
        return {
          stockCode: stockList[currentRunningCount],
          api: {
            status: apiStatus,
            ack: historicalData,
          },
          db: {
            status: dbStatus,
            ack,
          },
        };
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
    const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
    const apiInstance = await new UpstoxClient.HistoryApi();
    const { status: apiStatus, data: historicalData } = await getHistoricalData(instrumentalCode, apiInstance, TIME_INTERVAL.One_Minute, 50);

    const { status: dbStatus, ack } = await insertHistoricalData(stockCode, instrumentalCode, historicalData); // DB call

    res.json({
      stockCode: stockExchangeCode,
      api: {
        status: apiStatus,
        ack: historicalData,
      },
      db: {
        status: dbStatus,
        ack,
      },
    });
  },
  fetchHistoricalDataForParticularDate: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const { date } = req.query;
    const stockCode = stockExchangeCode.toUpperCase();
    const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
    const apiInstance = await new UpstoxClient.HistoryApi();
    const { status: apiStatus, data: historicalData } = await getHistoricalDataForParticularDate(
      instrumentalCode,
      apiInstance,
      TIME_INTERVAL.One_Minute,
      date
    );

    res.send({
      stockCode: stockExchangeCode,
      api: {
        status: apiStatus,
        ack: historicalData,
      },
    });
  },
};

export default historicalDataController;
