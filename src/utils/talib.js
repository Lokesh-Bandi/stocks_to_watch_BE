import { RSI, MFI, OBV } from 'technicalindicators';

import { DATA_ATTRIBUTES, MAX_DAYS_DATA, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchCompleteStockDataDB, fetchCustomDataValuesDB } from '../database/utils/dbHelper.js';

import {
  constructIntervalDataFromArray,
  constructIntervalDataFromAttributeArray,
  getFlattenAttributeData,
  getFlattenStockData,
} from './utilFuntions.js';

export const calculateRSI = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  const fetchedData = await fetchCustomDataValuesDB(stockExchangeCode, DATA_ATTRIBUTES.close);

  const intervalClosingPrices = constructIntervalDataFromAttributeArray(fetchedData, interval, DATA_ATTRIBUTES.close);
  const closingPricesArray = getFlattenAttributeData(intervalClosingPrices);

  const rsiInput = { period: timePeriod, values: closingPricesArray.reverse() };
  const rsiValues = RSI.calculate(rsiInput);

  return rsiValues;
};

export const calculateMFI = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  const fetchedData = await fetchCompleteStockDataDB(stockExchangeCode, MAX_DAYS_DATA);

  const attributesIntervalData = constructIntervalDataFromArray(fetchedData, interval);
  const attributesRequired = [DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.high, DATA_ATTRIBUTES.low, DATA_ATTRIBUTES.volume];
  const flattenStockData = getFlattenStockData(attributesIntervalData, attributesRequired);

  const msiInput = {
    period: timePeriod,
    high: flattenStockData.high.reverse(),
    low: flattenStockData.low.reverse(),
    close: flattenStockData.close.reverse(),
    volume: flattenStockData.volume.reverse(),
  };
  const msiValues = MFI.calculate(msiInput);

  return msiValues;
};

export const calculateOBV = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, lastNDays = 5) => {
  const fetchedData = await fetchCompleteStockDataDB(stockExchangeCode, lastNDays + 1);

  const attributesIntervalData = constructIntervalDataFromArray(fetchedData, interval);
  const attributesRequired = [DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.volume];
  const flattenStockData = getFlattenStockData(attributesIntervalData, attributesRequired);

  const obvInput = {
    close: flattenStockData.close.reverse(),
    volume: flattenStockData.volume.reverse(),
  };
  const obvValues = OBV.calculate(obvInput);

  return obvValues;
};
