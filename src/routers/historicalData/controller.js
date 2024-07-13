// import { ApiRateLimiter } from 'quick-api-rate-limiter';

import { getHistoricalData } from '../../api/upstoxAPI/apiFuntions.js';
import { TIME_INTERVAL } from '../../constants/appConstants.js';
import { NIFTY_500 } from '../../constants/constants.js';
import { insertDBWithLast30DatysData } from '../../database/modalFuns.js';
import ApiRateLimiter from '../../services/APILimitService.js';
import { getFlattenData, getFlattenDataToInterval, getInstrumentalCode, getLast30DaysHistoricalData } from '../../utils/utilFuntions.js';

export const controller = {
  fetchLast30DaysHistoricalData: async (req, res) => {
    try {
      const category = req.params.grp;
      const nifty500 = category === 'nifty500' ? NIFTY_500 : [];
      const executeAPI = async (apiInstance, currentRunningCount) => {
        const stockCode = getInstrumentalCode(nifty500[currentRunningCount]);
        const historicalData = await getHistoricalData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);
        return historicalData;
      };
      const apiRateLimiterInstance = new ApiRateLimiter(
        globalThis.breezeInstance,
        executeAPI,
        { maxCallsPerDay: 1000, maxCallsPerMinute: 250, maxCallsPerSecond: 25 },
        NIFTY_500.length
      );

      const { data: rateLimiterResult, message } = await apiRateLimiterInstance.startRateLimiter();

      await rateLimiterResult.forEach(async (stockData, ind) => {
        const last30DaysHistoricalData = getLast30DaysHistoricalData(stockData);
        const flattenData = getFlattenData(last30DaysHistoricalData);
        const flattenDataToInterval = getFlattenDataToInterval(flattenData, TIME_INTERVAL.Five_Minute);

        await insertDBWithLast30DatysData(nifty500[ind], flattenDataToInterval);
      });

      res.send(`Data save sucessfully -- ${message}`);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
};
