
import UpstoxClient from 'upstox-js-sdk';

import { TIME_INTERVAL } from '../../constants/appConstants.js';
import { getRSI } from '../../utils/talib.js';
import { getFlattenData, getFlattenDataToInterval, getLast30DaysHistoricalData, getInstrumentalCode } from '../../utils/utilFuntions.js';

import modal from './modal.js';
import { getHistoricalData } from '../../api/upstoxAPI/apiFuntions.js';

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
  fetchLast30DaysStockData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = getInstrumentalCode(stockExchangeCode);
    const apiInstance = await new UpstoxClient.HistoryApi();
    const historicalData = await getHistoricalData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);
    const last30DaysHistoricalData = getLast30DaysHistoricalData(historicalData);
    const flattenData = getFlattenData(last30DaysHistoricalData);
    const flattenDataToInterval = getFlattenDataToInterval(flattenData, TIME_INTERVAL.Five_Minute);

    // await insertDBWithLast30DatysData(stockExchangeCode, structuredData);

    res.send(flattenDataToInterval);
  },
  test: async (req, res) => {
    const stockName = req.params.st;
    const rsiValues = await getRSI(stockName, TIME_INTERVAL.One_Day);
    res.send(rsiValues);
  },
};
