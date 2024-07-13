import {
  getHistoricalData,
  getTodaysData,
} from '../../api/breezeAPI/apiFuntions.js';
import { TIME_INTERVAL } from '../../constants/appConstants.js';
import { STOCK_SYMBOLS } from '../../constants/constants.js';
import { updateDBWithTodaysData } from '../../database/modalFuns.js';
import ApiRateLimiter from '../../services/APILimitService.js';
import { getRSI } from '../../utils/talib.js';
import {
  constructStructuredData,
  filterData,
  getISecStockCode,
  getLast30DaysHistoricalData,
} from '../../utils/utilFuntions.js';
import axios from 'axios';
import crypto from 'crypto';

import modal from './modal.js';
import { API_KEY, SECRET_KEY } from '../../api/breezeAPI/keys.js';

export const controller = {
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
  fetchISecCode: async (req, res) => {
    const { stockExchangeCode } = req.params;
    try {
      const stockCodeInfo = await globalThis.breezeInstance.getNames({
        exchangeCode: 'BSE',
        stockCode: stockExchangeCode,
      });
      res.send(stockCodeInfo);
    } catch (e) {
      res.send(e);
    }
  },
  fetchLast30DaysStockData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const iSecStockCode = getISecStockCode(stockExchangeCode);
    const historicalData = await getHistoricalData(
      iSecStockCode,
      globalThis.breezeInstance,
      TIME_INTERVAL.Five_Minute
    );
    const filteredData = filterData(historicalData);
    const last30DaysHistoricalData = getLast30DaysHistoricalData(filteredData);

    console.log(last30DaysHistoricalData.length);

    const structuredData = constructStructuredData(last30DaysHistoricalData);

    // await insertDBWithLast30DatysData(stockExchangeCode, structuredData);

    res.send(structuredData);
  },

  fetchTodaysData: async (
    stockExchangeCode,
    interval = TIME_INTERVAL.Five_Minute
  ) => {
    const todayData = await getTodaysData(stockExchangeCode, interval);
    const filteredData = filterData(todayData);
    const structuredData = constructStructuredData(filteredData);
    await updateDBWithTodaysData(stockExchangeCode, { structuredData });
    return structuredData;
  },
  test: async (req, res) => {
    const stockName = req.params.st;
    const rsiValues = await getRSI(stockName, TIME_INTERVAL.One_Day);
    res.send(rsiValues);
  },
};
