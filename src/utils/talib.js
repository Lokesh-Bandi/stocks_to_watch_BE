import { BollingerBands, MFI, OBV, RSI } from 'technicalindicators';

import { DATA_ATTRIBUTES, MAX_DAYS_DATA, TECHNICAL_INDICATORS, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchCompleteStockDataDB, fetchCustomDataValuesDB } from '../database/utils/dbHelper.js';

import {
  constructIntervalDataFromArray,
  constructIntervalDataFromAttributeArray,
  getFlattenAttributeData,
  getFlattenStockData,
  roundToDecimalPlaces,
} from './utilFuntions.js';

const INVALID_VALUE = null;

export const calculateRSI = async (stockExchangeCode, instrumentalCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  try {
    const fetchedData = await fetchCustomDataValuesDB(instrumentalCode, DATA_ATTRIBUTES.close);

    const intervalClosingPrices = constructIntervalDataFromAttributeArray(fetchedData, interval, DATA_ATTRIBUTES.close);
    const closingPricesArray = getFlattenAttributeData(intervalClosingPrices);

    const rsiInput = { period: timePeriod, values: closingPricesArray.reverse() };
    const rsiValues = RSI.calculate(rsiInput) ?? [];

    const finalRSIValue = rsiValues.at(-1) ? rsiValues.at(-1) : INVALID_VALUE;
    return [stockExchangeCode, interval, finalRSIValue];
  } catch (e) {
    console.log(`Error while calculating RSI values ${stockExchangeCode}`, e);
    return [stockExchangeCode, interval, -1];
  }
};

export const calculateMFI = async (stockExchangeCode, instrumentalCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  try {
    const fetchedData = await fetchCompleteStockDataDB(instrumentalCode, MAX_DAYS_DATA);

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
    console.log(`Error while calculating MFI values ${stockExchangeCode}`, e);
    return [stockExchangeCode, interval, -1];
  }
};

export const calculateOBV = async (stockExchangeCode, instrumentalCode, interval = TIME_INTERVAL.One_Day, lastNDays = 5) => {
  const fetchedData = await fetchCompleteStockDataDB(instrumentalCode, lastNDays + 1);

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

export const technicalIndicatorRequiredAttibutes = (ti) => {
  switch (ti) {
    case TECHNICAL_INDICATORS.rsi:
    case TECHNICAL_INDICATORS.bollingerbands:
      return [DATA_ATTRIBUTES.close];
    case TECHNICAL_INDICATORS.mfi:
      return [DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.high, DATA_ATTRIBUTES.low, DATA_ATTRIBUTES.volume];
    default:
      return [DATA_ATTRIBUTES.open, DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.high, DATA_ATTRIBUTES.low, DATA_ATTRIBUTES.volume];
  }
};

export const coreRSICalc = (attributesObj) => {
  const inputValues = {
    period: 14,
    values: attributesObj.close,
  };
  const rsiValues = RSI.calculate(inputValues) ?? [];
  const finalRSIValue = rsiValues.at(-1) ? rsiValues.at(-1) : INVALID_VALUE;
  return finalRSIValue;
};

export const coreMFICalc = (attributesObj) => {
  const msiInput = {
    period: 14,
    high: attributesObj.high,
    low: attributesObj.low,
    close: attributesObj.close,
    volume: attributesObj.volume,
  };
  const msiValues = MFI.calculate(msiInput) ?? [];

  const finalMFIValue = msiValues.at(-1) ? msiValues.at(-1) : INVALID_VALUE;
  return finalMFIValue;
};

export const coreBollingerBandsCalc = (attributesObj) => {
  const invalidValue = null;
  const bbInput = {
    period: 20,
    values: attributesObj.close,
    stdDev: 2,
  };
  const bbValues = BollingerBands.calculate(bbInput) ?? [];
  const latestBBValue = bbValues.at(-1) ? bbValues.at(-1) : invalidValue;
  const finalBBValue = latestBBValue;
  if (latestBBValue) {
    Object.entries(latestBBValue).forEach(([key, value]) => {
      finalBBValue[key] = roundToDecimalPlaces(value, 2);
    });
  }
  return finalBBValue;
};

export const calculateAllTisForTheStock = async (stockExchangeCode, instrumentalCode) => {
  try {
    const fetchedData = await fetchCompleteStockDataDB(instrumentalCode, MAX_DAYS_DATA);

    const TechnicalIndicators = [TECHNICAL_INDICATORS.rsi, TECHNICAL_INDICATORS.mfi, TECHNICAL_INDICATORS.bollingerbands];
    const Intervals = [TIME_INTERVAL.Fifteen_Minute, TIME_INTERVAL.Four_Hour, TIME_INTERVAL.One_Day];

    const tiValues = TechnicalIndicators.reduce((acc, eachTI) => {
      acc[eachTI] = {};
      return acc;
    }, {});

    Intervals.forEach((eachInterval) => {
      const attributesIntervalData = constructIntervalDataFromArray(fetchedData, eachInterval);
      const attributesRequired = [DATA_ATTRIBUTES.open, DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.high, DATA_ATTRIBUTES.low, DATA_ATTRIBUTES.volume];
      const flattenStockData = getFlattenStockData(attributesIntervalData, attributesRequired);

      const intervalStockData = {
        open: flattenStockData.open.reverse(),
        high: flattenStockData.high.reverse(),
        low: flattenStockData.low.reverse(),
        close: flattenStockData.close.reverse(),
        volume: flattenStockData.volume.reverse(),
      };

      TechnicalIndicators.forEach((eachTI) => {
        const requiredAttributes = technicalIndicatorRequiredAttibutes(eachTI);
        const attributeValues = requiredAttributes.reduce((acc, reqAttr) => {
          acc[reqAttr] = intervalStockData[reqAttr];
          return acc;
        }, {});
        switch (eachTI) {
          case TECHNICAL_INDICATORS.rsi: {
            tiValues[eachTI][eachInterval] = coreRSICalc(attributeValues);
            break;
          }
          case TECHNICAL_INDICATORS.mfi: {
            tiValues[eachTI][eachInterval] = coreMFICalc(attributeValues);
            break;
          }
          case TECHNICAL_INDICATORS.bollingerbands: {
            tiValues[eachTI][eachInterval] = coreBollingerBandsCalc(attributeValues);
            break;
          }
          default: {
            //
          }
        }
      });
    });

    return {
      stockExchangeCode,
      tiValues,
    };
  } catch (e) {
    console.log(`Error while calculating MFI values ${stockExchangeCode}`, e);
    return [];
  }
};
