import { MFI, OBV, RSI } from 'technicalindicators';

import { DATA_ATTRIBUTES, MAX_DAYS_DATA, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchCompleteStockDataDB, fetchCustomDataValuesDB } from '../database/utils/dbHelper.js';

import {
  constructIntervalDataFromArray,
  constructIntervalDataFromAttributeArray,
  getFlattenAttributeData,
  getFlattenStockData,
} from './utilFuntions.js';

const INVALID_VALUE = -1;

export const calculateRSI = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  try {
    const fetchedData = await fetchCustomDataValuesDB(stockExchangeCode, DATA_ATTRIBUTES.close);

    const intervalClosingPrices = constructIntervalDataFromAttributeArray(fetchedData, interval, DATA_ATTRIBUTES.close);
    const closingPricesArray = getFlattenAttributeData(intervalClosingPrices);

    const rsiInput = { period: timePeriod, values: closingPricesArray.reverse() };
    const rsiValues = RSI.calculate(rsiInput) ?? [];

    const finalRSIValue = rsiValues.at(-1) ? rsiValues.at(-1) : INVALID_VALUE;
    return [stockExchangeCode, interval, finalRSIValue];
  } catch (e) {
    console.log('Error while calculating RSI values', e);
    return [stockExchangeCode, interval, -1];
  }
};

export const calculateMFI = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  try {
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
    const msiValues = MFI.calculate(msiInput) ?? [];

    const finalMFIValue = msiValues.at(-1) ? msiValues.at(-1) : INVALID_VALUE;
    return [stockExchangeCode, interval, finalMFIValue];
  } catch (e) {
    console.log('Error while calculating MFI values', e);
    return [stockExchangeCode, interval, -1];
  }
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
