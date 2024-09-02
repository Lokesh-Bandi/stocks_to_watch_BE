import { BollingerBands, MFI, OBV, RSI } from 'technicalindicators';

import {
  DATA_ATTRIBUTES,
  MAX_DAYS_DATA,
  PRICE_TREND,
  STOCK_MARKET_MOVEMENT,
  TECHNICAL_INDICATORS,
  TIME_INTERVAL,
  VOLUME_TREND,
} from '../constants/appConstants.js';
import { fetchCompleteStockDataDB, fetchCustomDataValuesDB } from '../database/utils/dbHelper.js';

import { candlestickPattternStatus } from './patterns.js';
import {
  constructIntervalDataFromArray,
  constructIntervalDataFromAttributeArray,
  getFlattenAttributeData,
  getFlattenStockData,
  roundToDecimalPlaces,
} from './utilFuntions.js';

const INVALID_VALUE = null;

const reverseArray = (arr) => {
  return arr.reverse();
};

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
      high: reverseArray(flattenStockData.high),
      low: reverseArray(flattenStockData.low),
      close: reverseArray(flattenStockData.close),
      volume: reverseArray(flattenStockData.volume),
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
    close: reverseArray(flattenStockData.close),
    volume: reverseArray(flattenStockData.volume),
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
    case TECHNICAL_INDICATORS.volumeSpike:
      return [DATA_ATTRIBUTES.volume, DATA_ATTRIBUTES.close];
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
  const finalRSIValue = rsiValues.at(-1) !== undefined ? rsiValues.at(-1) : INVALID_VALUE;
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

  const finalMFIValue = msiValues.at(-1) !== undefined ? msiValues.at(-1) : INVALID_VALUE;
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

export const coreVolumeSpike = (attributesObj) => {
  const lastNCandlesVolume = 20;
  const multiplier = 3;
  const { close, volume } = attributesObj;
  const volumeTradedToday = volume.at(-1) ? volume.at(-1) : 0;
  const lastNCandlesVolumeArray = volume.slice(-lastNCandlesVolume + 1, -1) ?? [];
  const totalVolume = lastNCandlesVolumeArray.reduce((acc, eachCandleVolume) => {
    if (eachCandleVolume) return acc + eachCandleVolume;
    return acc;
  }, 0);
  const avgVolume = totalVolume / lastNCandlesVolume;
  const volumeChangedBy = roundToDecimalPlaces(volumeTradedToday / avgVolume, 2);
  const priceTrend = close.at(-2) > close.at(-1) ? PRICE_TREND.down : PRICE_TREND.up;
  if (volumeTradedToday >= avgVolume * multiplier) {
    if (PRICE_TREND.down === priceTrend) {
      return {
        volume: volumeTradedToday,
        volumeTrend: VOLUME_TREND.downTrend,
        volumeChangedBy,
      };
    }
    return {
      volume: volumeTradedToday,
      volumeTrend: VOLUME_TREND.upTrend,
      volumeChangedBy,
    };
  }
  return {
    volume: volumeTradedToday,
    volumeTrend: VOLUME_TREND.neutral,
    volumeChangedBy,
  };
};

export const calculateAllTisForTheStock = async (stockExchangeCode, instrumentalCode) => {
  try {
    const fetchedData = await fetchCompleteStockDataDB(instrumentalCode, MAX_DAYS_DATA);
    const TechnicalIndicators = [
      TECHNICAL_INDICATORS.rsi,
      TECHNICAL_INDICATORS.mfi,
      TECHNICAL_INDICATORS.bollingerbands,
      TECHNICAL_INDICATORS.volumeSpike,
    ];
    const Intervals = [TIME_INTERVAL.Fifteen_Minute, TIME_INTERVAL.Four_Hour, TIME_INTERVAL.One_Day];
    const momentumStatus = STOCK_MARKET_MOVEMENT.neutral;
    let candlestickPattterns;
    const tiValues = TechnicalIndicators.reduce((acc, eachTI) => {
      acc[eachTI] = {};
      return acc;
    }, {});

    Intervals.forEach((eachInterval) => {
      const attributesIntervalData = constructIntervalDataFromArray(fetchedData, eachInterval);
      const attributesRequired = [DATA_ATTRIBUTES.open, DATA_ATTRIBUTES.close, DATA_ATTRIBUTES.high, DATA_ATTRIBUTES.low, DATA_ATTRIBUTES.volume];
      const flattenStockData = getFlattenStockData(attributesIntervalData, attributesRequired);

      const intervalStockData = {
        open: reverseArray(flattenStockData.open),
        high: reverseArray(flattenStockData.high),
        low: reverseArray(flattenStockData.low),
        close: reverseArray(flattenStockData.close),
        volume: reverseArray(flattenStockData.volume),
      };

      TechnicalIndicators.forEach((eachTI) => {
        const requiredAttributes = technicalIndicatorRequiredAttibutes(eachTI);
        const attributeValues = requiredAttributes.reduce((acc, reqAttr) => {
          acc[reqAttr] = intervalStockData[reqAttr] ?? [];
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
          case TECHNICAL_INDICATORS.volumeSpike: {
            tiValues[eachTI][eachInterval] = coreVolumeSpike(attributeValues);
            break;
          }
          default: {
            //
          }
        }
      });

      // Bullish or Bearish for 4Hr interval
      if (eachInterval === TIME_INTERVAL.Four_Hour) {
        candlestickPattterns = candlestickPattternStatus(intervalStockData);
      }
    });

    return {
      stockExchangeCode,
      tiValues,
      momentumStatus,
      candlestickPattterns,
    };
  } catch (e) {
    console.log(`Error while calculating MFI values ${stockExchangeCode}`, e);
    return [];
  }
};
