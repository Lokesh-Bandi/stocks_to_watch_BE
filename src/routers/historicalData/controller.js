// import { ApiRateLimiter } from 'quick-api-rate-limiter';

import { getHistoricalData } from '../../api/breezeAPI/apiFuntions.js';
import { TIME_INTERVAL } from '../../constants/appConstants.js';
import { NIFTY_500 } from '../../constants/constants.js';
import { insertDBWithLast30DatysData } from '../../database/modalFuns.js';
import ApiRateLimiter from '../../services/APILimitService.js';
import {
  constructStructuredData,
  filterData,
  getISecStockCode,
  getLast30DaysHistoricalData,
} from '../../utils/utilFuntions.js';

export const controller = {
  fetchLast30DaysHistoricalData: async (req, res) => {
    try {
      const category = req.params.grp;
      const nifty500 = category === 'nifty500' ? NIFTY_500 : [];
      const executeAPI = async (apiInstance, currentRunningCount) => {
        const iSecStockCode = getISecStockCode(nifty500[currentRunningCount]);
        const historicalData = await getHistoricalData(
          iSecStockCode,
          apiInstance,
          TIME_INTERVAL.Five_Minute
        );
        return historicalData;
      };
      const apiRateLimiterInstance = new ApiRateLimiter(
        globalThis.breezeInstance,
        executeAPI,
        { maxCallsPerDay: 5000, maxCallsPerMinute: 100 },
        500
      );

      const { data: rateLimiterResult, message } =
        await apiRateLimiterInstance.startRateLimiter();

      await rateLimiterResult.forEach(async (stockData, ind) => {
        const filteredData = filterData(stockData);
        const last30DaysHistoricalData =
          getLast30DaysHistoricalData(filteredData);

        console.log(last30DaysHistoricalData.length);

        const structuredData = constructStructuredData(
          last30DaysHistoricalData
        );

        await insertDBWithLast30DatysData(nifty500[ind], structuredData);
      });

      res.send(`Data save sucessfully -- ${message}`);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
};
