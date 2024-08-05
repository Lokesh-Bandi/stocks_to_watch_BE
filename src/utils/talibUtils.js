import {
  BOLLINGERBANDS_KEYS,
  MFI_KEYS,
  RSI_KEYS,
  TECH_INDICATOR_TIME_INTERVALS,
  TECHNICAL_INDICATORS,
  TECHNICAL_INDICATORS_ARR,
} from '../constants/appConstants.js';

import { calculateMFI, calculateRSI } from './talib.js';

/**
 * Object with key as a TIME_INTERVAL value with corresponding techincal indicator value.
 * @typedef {Object.<string, number>} TechIndicatorIntervalValuesArray
 */

/**
 * Technical indicator response
 * @typedef {Array} TechIndicatorResponse
 * @property {string} 0 - stockExchangeCode
 * @property {string} 1 - interval
 * @property {string} 1 - technical indicator value
 */

/**
 * Function to construct an stockwise indicator values object with key as a stockExhangeCode and value as a corresponding rsi interval values.
 * @param {Array<Array<TechIndicatorResponse>>} arrayOfTechIndicatorResponse
 * @returns {Object.<string, TechIndicatorIntervalValuesArray>} - returns an object with key as a stockExchangeCode and value as a interval object with respective rsi values
 */
export const constructIntervalTechIndicatorStoringObject = (arrayOfTechIndicatorResponse) => {
  if (!Array.isArray(arrayOfTechIndicatorResponse) || arrayOfTechIndicatorResponse.length === 0) return null;
  let returnObj = {};
  arrayOfTechIndicatorResponse.forEach((stockIntervalRSIValues) => {
    stockIntervalRSIValues.forEach((eachIntervalStockData) => {
      const [stockExchangeCode, interval, rsi] = eachIntervalStockData;
      returnObj = {
        ...returnObj,
        [stockExchangeCode]: {
          ...returnObj[stockExchangeCode],
          [interval]: rsi,
        },
      };
    });
  });

  return returnObj;
};

/**
 * Function to return a corresponding technical indicator compute funtion
 * @param {string} technicalIndicator - Should be one of the TECHNICAL_INDICATORS value
 */
export const deriveTechnicalIndicatorFunction = (technicalIndicator) => {
  switch (technicalIndicator) {
    case TECHNICAL_INDICATORS.rsi:
      return calculateRSI;
    case TECHNICAL_INDICATORS.mfi:
      return calculateMFI;
    default:
      return null;
  }
};

export const isValidTechIndicator = (technicalIndicator) => {
  const availableTechIndicators = Object.values(TECHNICAL_INDICATORS);
  return availableTechIndicators.includes(technicalIndicator);
};

const getRsiStatusForAStock = (value) => {
  if (value <= 30) {
    return RSI_KEYS.lessthan30;
  }
  if (value >= 70) {
    return RSI_KEYS.morethan70;
  }
  if (value > 30 && value <= 40) {
    return RSI_KEYS.nearTo30;
  }
  if (value < 70 && value >= 60) {
    return RSI_KEYS.nearTo70;
  }
  return null;
};

const getMfiStatusForAStock = (value) => {
  if (value <= 20) {
    return MFI_KEYS.lessthan20;
  }
  if (value >= 80) {
    return MFI_KEYS.morethan80;
  }
  if (value > 20 && value <= 40) {
    return MFI_KEYS.nearTo20;
  }
  if (value < 80 && value >= 60) {
    return MFI_KEYS.nearTo80;
  }
  return null;
};

const getBollingerBandStatusForAStock = (value) => {
  if (value <= 0) {
    return BOLLINGERBANDS_KEYS.lessthan0;
  }
  if (value >= 1) {
    return BOLLINGERBANDS_KEYS.morethan1;
  }
  if (value > 0 && value <= 0.1) {
    return BOLLINGERBANDS_KEYS.nearTo0D1;
  }
  if (value < 1 && value >= 0.9) {
    return BOLLINGERBANDS_KEYS.nearTo0D9;
  }
  return null;
};
const getKeyStocksBaseObject = () => {
  const baseObject = {};
  TECHNICAL_INDICATORS_ARR.forEach((eachTI) => {
    baseObject[eachTI] = {};
    TECH_INDICATOR_TIME_INTERVALS.forEach((eachInterval) => {
      baseObject[eachTI][eachInterval] = {};
      switch (eachTI) {
        case TECHNICAL_INDICATORS.rsi: {
          Object.keys(RSI_KEYS).forEach((eachRsiKey) => {
            baseObject[eachTI][eachInterval][eachRsiKey] = [];
          });
          break;
        }
        case TECHNICAL_INDICATORS.mfi: {
          Object.keys(MFI_KEYS).forEach((eachMfiKey) => {
            baseObject[eachTI][eachInterval][eachMfiKey] = [];
          });
          break;
        }
        case TECHNICAL_INDICATORS.bollingerbands: {
          Object.keys(BOLLINGERBANDS_KEYS).forEach((eachBBKey) => {
            baseObject[eachTI][eachInterval][eachBBKey] = [];
          });
          break;
        }
        default: {
          //
        }
      }
    });
  });
  return baseObject;
};
export const filterKeyStocksFromIndicators = (allStocks) => {
  const keyStocks = getKeyStocksBaseObject();
  allStocks.forEach(({ stockExchangeCode, tiValues }) => {
    Object.entries(tiValues).forEach(([tiName, techIndIntervalObj]) => {
      Object.entries(techIndIntervalObj).forEach(([intervalName, intervalValue]) => {
        switch (tiName) {
          case TECHNICAL_INDICATORS.rsi: {
            const rsiKey = getRsiStatusForAStock(intervalValue);
            if (rsiKey) {
              keyStocks[tiName][intervalName][rsiKey].push({
                stockExchangeCode,
                value: intervalValue,
              });
            }
            break;
          }
          case TECHNICAL_INDICATORS.mfi: {
            const mfiKey = getMfiStatusForAStock(intervalValue);
            if (mfiKey) {
              keyStocks[tiName][intervalName][mfiKey].push({
                stockExchangeCode,
                value: intervalValue,
              });
            }
            break;
          }
          case TECHNICAL_INDICATORS.bollingerbands: {
            const bollingerbandsKey = getBollingerBandStatusForAStock(intervalValue.pb);
            if (bollingerbandsKey) {
              keyStocks[tiName][intervalName][bollingerbandsKey].push({
                stockExchangeCode,
                value: intervalValue,
              });
            }
            break;
          }
          default:
            break;
        }
      });
    });
  });
  return keyStocks;
};
