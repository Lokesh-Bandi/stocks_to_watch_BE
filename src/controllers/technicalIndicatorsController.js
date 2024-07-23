import { ERROR_MESSAGE, TECH_INDICATOR_TIME_INTERVALS, TECHNICAL_INDICATORS, TIME_INTERVAL } from '../constants/appConstants.js';
import { calculateMFI, calculateOBV, calculateRSI } from '../utils/talib.js';
import { getStcokList, isCorrectTimeInterval } from '../utils/utilFuntions.js';

const technicalIndicatorsController = {
  fetchTechnicalIndicatorValue: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { ti, interval, timePeriod } = req.query;
    const technicalIndicator = ti.toUpperCase();
    const timeInterval = isCorrectTimeInterval(interval) ? interval : TIME_INTERVAL.One_Day;
    let technicalIndicatorResponse;
    switch (technicalIndicator) {
      case TECHNICAL_INDICATORS.rsi:
        technicalIndicatorResponse = await calculateRSI(stockCode, timeInterval, timePeriod);
        break;
      case TECHNICAL_INDICATORS.mfi:
        technicalIndicatorResponse = await calculateMFI(stockCode, timeInterval, timePeriod);
        break;
      case TECHNICAL_INDICATORS.obv:
        technicalIndicatorResponse = await calculateOBV(stockCode, timeInterval);
        break;
      default:
        technicalIndicatorResponse = null;
    }
    res.send(technicalIndicatorResponse);
  },
  updateGroupCustomTIValue: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStcokList(category);

      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }
      const promiseQueue = [];

      stockList.forEach((stockExchangeCode) => {
        const intervalPromiseQeue = [];
        TECH_INDICATOR_TIME_INTERVALS.forEach((eachTimeInterval) => {
          intervalPromiseQeue.push(calculateRSI(stockExchangeCode, eachTimeInterval));
        });
        promiseQueue.push(intervalPromiseQeue);
      });

      const indicatorResponse = await Promise.all(
        promiseQueue.map(async (innerPromiseArray) => {
          const nestedResponse = await Promise.all(innerPromiseArray);
          return nestedResponse;
        })
      );
      res.send(indicatorResponse);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
};

export default technicalIndicatorsController;
