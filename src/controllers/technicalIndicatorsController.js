import { DB_STATUS, ERROR_MESSAGE, TECH_INDICATOR_TIME_INTERVALS, TECHNICAL_INDICATORS, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchInstrumentalCodeForSpecificStockDB, fetchInstrumentalCodesDB } from '../database/utils/dbHelper.js';
import { deriveTechIndicatorDBFuntion } from '../models/modelUtils.js';
import { updateAllKeyStocks, updateALLTechnicalIndicators } from '../models/technicalIndicatorsModel.js';
import { calculateAllTisForTheStock, calculateMFI, calculateOBV, calculateRSI } from '../utils/talib.js';
import { constructIntervalTechIndicatorStoringObject, deriveTechnicalIndicatorFunction, filterKeyStocksFromIndicators } from '../utils/talibUtils.js';
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
    const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
    if (!instrumentalCode) {
      res.send(ERROR_MESSAGE.unknownStockCode);
      return;
    }
    const timeInterval = isCorrectTimeInterval(interval) ? interval : TIME_INTERVAL.One_Day;
    let technicalIndicatorResponse;
    switch (technicalIndicator) {
      case TECHNICAL_INDICATORS.rsi:
        technicalIndicatorResponse = await calculateRSI(stockExchangeCode, instrumentalCode, timeInterval, timePeriod);
        break;
      case TECHNICAL_INDICATORS.mfi:
        technicalIndicatorResponse = await calculateMFI(stockExchangeCode, instrumentalCode, timeInterval, timePeriod);
        break;
      case TECHNICAL_INDICATORS.obv:
        technicalIndicatorResponse = await calculateOBV(stockExchangeCode, instrumentalCode, timeInterval);
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
      const instrumentalCodes = await fetchInstrumentalCodesDB();
      const promiseQueue = [];
      const { ti } = req.query;

      if (!ti) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }
      if (!instrumentalCodes) {
        res.send(ERROR_MESSAGE.noInstrumentalCodes);
        return;
      }

      const technicalIndicator = ti.toUpperCase();
      const computeTechnicalIndicatorFun = deriveTechnicalIndicatorFunction(technicalIndicator);
      const updateDBFuntion = deriveTechIndicatorDBFuntion(technicalIndicator);

      if (!computeTechnicalIndicatorFun || !updateDBFuntion) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }

      stockList.forEach((stockExchangeCode) => {
        const intervalPromiseQeue = [];
        const instrumentalCode = instrumentalCodes[stockExchangeCode];
        TECH_INDICATOR_TIME_INTERVALS.forEach((eachTimeInterval) => {
          intervalPromiseQeue.push(computeTechnicalIndicatorFun(stockExchangeCode, instrumentalCode, eachTimeInterval));
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
      const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
      const { ti } = req.query;

      if (!ti) {
        res.send(ERROR_MESSAGE.unknownTechIndicator);
        return;
      }
      if (!instrumentalCode) {
        res.send(ERROR_MESSAGE.unknownStockCode);
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
        promiseQueue.push(computeTechnicalIndicatorFun(stockExchangeCode, instrumentalCode, eachTimeInterval));
      });

      const indicatorResponse = await Promise.all(promiseQueue);

      const techIndicatorStoringObject = constructIntervalTechIndicatorStoringObject([indicatorResponse]);
      await updateDBFuntion(techIndicatorStoringObject);
      res.send(techIndicatorStoringObject);
    } catch (e) {
      res.send(`Error ocurred : ${e}`);
    }
  },
  updateAllTechnicalIndicators: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStockList(category);
      const promiseQueue = [];
      const instrumentalCodes = await fetchInstrumentalCodesDB();

      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }
      if (!instrumentalCodes) {
        res.send(ERROR_MESSAGE.noInstrumentalCodes);
        return;
      }

      stockList.forEach((stockExchangeCode) => {
        const instrumentalCode = instrumentalCodes[stockExchangeCode];
        promiseQueue.push(calculateAllTisForTheStock(stockExchangeCode, instrumentalCode));
      });
      const response = await Promise.all(promiseQueue);
      const dbUpdationStatusForTIValues = await updateALLTechnicalIndicators(response); // technicalIndicatorSchema DB udpate

      const keyStocksForAllTechnicalIndicators = filterKeyStocksFromIndicators(response);
      const dbUpdationStatusForKeyStocks = await updateAllKeyStocks(keyStocksForAllTechnicalIndicators); // keyStocksSchema DB update

      res.json({
        tiValues: dbUpdationStatusForTIValues,
        keyStocks: dbUpdationStatusForKeyStocks,
        ta: response,
      });
    } catch (e) {
      console.log(`Error ocurred while computing technical indicators: ${e}`);
      res.json({
        tiValues: {
          status: DB_STATUS.error,
          ack: ERROR_MESSAGE.errorInAllTechInd,
        },
        keyStocks: {
          status: DB_STATUS.error,
          ack: ERROR_MESSAGE.errorinKeyStocks,
        },
      });
    }
  },
};

export default technicalIndicatorsController;
