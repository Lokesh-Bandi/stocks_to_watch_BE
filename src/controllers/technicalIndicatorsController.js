import { ERROR_MESSAGE, TECH_INDICATOR_TIME_INTERVALS, TECHNICAL_INDICATORS, TIME_INTERVAL } from '../constants/appConstants.js';
import { deriveTechIndicatorDBFuntion } from '../models/modelUtils.js';
import { calculateMFI, calculateOBV, calculateRSI } from '../utils/talib.js';
import { constructIntervalTechIndicatorStoringObject, deriveTechnicalIndicatorFunction } from '../utils/talibUtils.js';
import { getStockList, isCorrectTimeInterval } from '../utils/utilFuntions.js';

const technicalIndicatorsController = {
  fetchTechnicalIndicatorValue: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { ti, interval, timePeriod } = req.query;
    if (!ti) {
      res.send(ERROR_MESSAGE.unknownTechIndicator);
      return;
    }
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
      const stockList = getStockList(category);
      const { ti } = req.query;
      if (!ti) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }
      const computeTechnicalIndicatorFun = deriveTechnicalIndicatorFunction(ti.toUpperCase());
      const updateDBFuntion = deriveTechIndicatorDBFuntion(ti.toUpperCase());

      if (!computeTechnicalIndicatorFun) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      if (!updateDBFuntion) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }

      const promiseQueue = [];

      stockList.forEach((stockExchangeCode) => {
        const intervalPromiseQeue = [];
        TECH_INDICATOR_TIME_INTERVALS.forEach((eachTimeInterval) => {
          intervalPromiseQeue.push(computeTechnicalIndicatorFun(stockExchangeCode, eachTimeInterval));
        });
        promiseQueue.push(intervalPromiseQeue);
      });

      const indicatorResponse = await Promise.all(
        promiseQueue.map(async (innerPromiseArray) => {
          const nestedResponse = await Promise.all(innerPromiseArray);
          return nestedResponse;
        })
      );

      const techIndicatorStoringObject = constructIntervalTechIndicatorStoringObject(indicatorResponse);
      await updateDBFuntion(techIndicatorStoringObject);
      res.send(techIndicatorStoringObject);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
  updateCustomTIValueForSingleStock: async (req, res) => {
    try {
      const { stockExchangeCode } = req.params;
      const stockCode = stockExchangeCode.toUpperCase();
      const { ti } = req.query;
      if (!ti) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      const technicalIndicator = ti.toUpperCase();
      const computeTechnicalIndicatorFun = deriveTechnicalIndicatorFunction(technicalIndicator);
      const updateDBFuntion = deriveTechIndicatorDBFuntion(technicalIndicator);
      const promiseQueue = [];

      if (!computeTechnicalIndicatorFun) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      if (!updateDBFuntion) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }

      TECH_INDICATOR_TIME_INTERVALS.forEach((eachTimeInterval) => {
        promiseQueue.push(computeTechnicalIndicatorFun(stockCode, eachTimeInterval));
      });

      const indicatorResponse = await Promise.all(promiseQueue);

      const techIndicatorStoringObject = constructIntervalTechIndicatorStoringObject([indicatorResponse]);
      await updateDBFuntion(techIndicatorStoringObject);
      res.send(techIndicatorStoringObject);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
};

export default technicalIndicatorsController;
