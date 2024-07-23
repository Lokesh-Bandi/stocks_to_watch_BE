import { INSTRUMENT_KEYS } from '../api/upstoxAPI/constants.js';
import { DATA_ATTRIBUTES, FLAT_GAP, INDEXES, OPERATOR_NAME, TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';

/**
 * StockDataAttributesObject --> { datetime, open, close, high, low, volume }
 * @typedef {Object} StockDataAttributesObject
 * @property {string[]} datetime - Format(2024-07-16T15:25:00+05:30)
 * @property {number[]} open - Open prices
 * @property {number[]} high - High prices
 * @property {number[]} low - Low prices
 * @property {number[]} close - Close prices
 * @property {number[]} vloume - Volume
 */

/**
 * StockDataAttributesObject --> { datetime, open, close, high, low, volume }
 * @typedef {Object} StockDataAttributesObjectOptional
 * @property {string[]} [datetime] - Format(2024-07-16T15:25:00+05:30)
 * @property {number[]} [open] - Open prices
 * @property {number[]} [high] - High prices
 * @property {number[]} [low] - Low prices
 * @property {number[]} [close] - Close prices
 * @property {number[]} [vloume] - Volume
 */

/**
 * Upstox response data type from API historical/today data
 * @typedef {Array} UpstoxStockDataAPIResponse
 * @property {string} 0 - datetime in format (2024-07-16T15:25:00+05:30)
 * @property {number} 1 - open price
 * @property {number} 2 - high price
 * @property {number} 3 - low price
 * @property {number} 4 - close price
 * @property {number} 5 - volumes traded
 * @property {number} 6 - open interest
 */

/**
 * history_stock_info collection document data attribute represents array of below object
 * @typedef {Object} SingleDayDatabaseStockDataObject
 * @property {string} date - date in the format of YYYY-MM-DD
 * @property {StockDataAttributesObject} stockData
 */

/**
 * Represents a single stock attribute object.
 * @typedef {Object} SingleStockAttibuteResponse
 * @property {string} date - The date string in yyyy-mm-dd format.
 * @property {number[] | string[]} attributeValues - Attribute values for a specified attribute
 */

/**
 * Stock data according to date wise object
 * @typedef {Object} DateWiseDataObject
 * @property {UpstoxStockDataAPIResponse[]} [dynamicDateKey: string ] - key as this date 2024-07-15 format
 */

/**
 * Funtion to extract the date and time from below format (2024-07-16T15:25:00+05:30)
 * @param {string} datetimeString
 * @returns {Object} - { date, time }
 */
export const extractDateAndTime = (datetimeString) => {
  const datetime = new Date(datetimeString);
  const extractedDate = datetime.toISOString().split('T')[0];
  const extractedTime = datetime.toISOString().split('T')[1].split('+')[0];
  return { date: extractedDate, time: extractedTime };
};

/**
 * Function to extract the stock data of mentioned number of days for a stock
 * @param {UpstoxStockDataAPIResponse[]} stockInfo - Array that contains OHLCV info for all candles
 * @param {number} [noOfDays] - Extracts last n days data from response
 * @returns {DateWiseDataObject}
 */
export const getLastNTradingDatesHistoricalData = (stockInfo, noOfDays = 50) => {
  const datesSet = new Set();
  const filteredDataForLastNTradingDates = {};

  for (let i = 0; i < stockInfo.length; i += 1) {
    const { date } = extractDateAndTime(stockInfo[i][0]);
    datesSet.add(date);
    if (datesSet.size === noOfDays + 1) {
      break;
    }
    if (!filteredDataForLastNTradingDates[date]) {
      filteredDataForLastNTradingDates[date] = [];
    }
    filteredDataForLastNTradingDates[date].push(stockInfo[i]);
  }

  return filteredDataForLastNTradingDates;
};

/**
 * Funtion to return an instrumental code which uses by upstox instance to fetch the respective stock data
 * @param {string} stockExchangeCode
 * @returns {string} - instrumental code format (NSE_EQ|INE466L01038)
 */
export const getInstrumentalCode = (stockExchangeCode) => {
  return INSTRUMENT_KEYS[stockExchangeCode]?.[0];
};

/**
 * @param {string} stockExchangeCode
 * @returns {string} -- Full company name
 */
export const getCompanyName = (stockExchangeCode) => {
  return INSTRUMENT_KEYS[stockExchangeCode][1];
};

export const flatStockData = (arr, flatGap, operatorName) => {
  const operator = operatorName === OPERATOR_NAME.max ? Math.max : Math.min;
  if (arr.length < flatGap) return arr;
  const flattedArr = [];
  let elementsProcessed = 0;
  while (elementsProcessed < arr.length) {
    const flatValue = operator(...arr.slice(elementsProcessed, elementsProcessed + flatGap));
    flattedArr.push(flatValue);
    elementsProcessed += flatGap;
  }
  return flattedArr;
};

/**
 * Funtion to return an integer for breaking of an array into mentioned interval size
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @returns {number} - integer for respective time intervals if exists else 5 minute interval
 */
export const getflatGap = (interval) => {
  switch (interval) {
    case TIME_INTERVAL.Five_Minute:
      return FLAT_GAP.Five_Minute;
    case TIME_INTERVAL.Ten_Minute:
      return FLAT_GAP.Ten_Minute;
    case TIME_INTERVAL.Fifteen_Minute:
      return FLAT_GAP.Fifteen_Minute;
    case TIME_INTERVAL.Thirty_Minute:
      return FLAT_GAP.Thirty_Minute;
    case TIME_INTERVAL.Four_Hour:
      return FLAT_GAP.Four_Hour;
    case TIME_INTERVAL.One_Day:
      return FLAT_GAP.One_Day;
    default:
      return FLAT_GAP.Five_Minute;
  }
};

/**
 * Funtion to reutrn a date in YYYY-MM-DD format
 * @param {Date} date - Should be a date instance
 * @returns {string} - YYYY-MM-DD format
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Return current Date in YYYY-MM-DD format
 * @returns {string} - YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  const date = new Date();
  return formatDate(date);
};

/**
 * Funtion to reutrn a past date in YYYY-MM-DD format from today by mentioned days
 * @param {Date} date - Should be a date instance
 * @param {number} [n] - number that specifies to get the past date from today
 * @returns {string} - YYYY-MM-DD format
 */
export const getLastNDaysBackDate = (date, n = 0) => {
  const currentDate = new Date(date);
  const timestamp = currentDate.getTime();
  const timestampNDaysAgo = timestamp - n * 24 * 60 * 60 * 1000;
  const dateNDaysAgo = new Date(timestampNDaysAgo);
  return formatDate(dateNDaysAgo);
};

export const getFlattenData = (stockData) => {
  const storingObject = {
    datetime: [],
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  };

  const structuredData = stockData.reduce((acc, eachIntervalData) => {
    acc.datetime.push(eachIntervalData[0]);
    acc.open.push(eachIntervalData[1]);
    acc.high.push(eachIntervalData[2]);
    acc.low.push(eachIntervalData[3]);
    acc.close.push(eachIntervalData[4]);
    acc.volume.push(eachIntervalData[5]);
    return acc;
  }, storingObject);

  return structuredData;
};

export const getFlattenDataToInterval = (stockData, interval) => {
  const { datetime, open, high, low, close, volume } = stockData;
  let elementsProcessed = 0;
  const flattenInterval = getflatGap(interval);
  const flattenDataToInterval = {
    datetime: [],
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  };
  while (elementsProcessed < datetime.length) {
    const newDatetime = datetime.slice(elementsProcessed, elementsProcessed + flattenInterval)[0];
    const newOpen = open.slice(elementsProcessed, elementsProcessed + flattenInterval)[0];
    const newHigh = Math.max(...high.slice(elementsProcessed, elementsProcessed + flattenInterval));
    const newLow = Math.min(...low.slice(elementsProcessed, elementsProcessed + flattenInterval));
    const newClose = close.slice(elementsProcessed, elementsProcessed + flattenInterval)[flattenInterval - 1];
    const newVolume = volume.slice(elementsProcessed, elementsProcessed + flattenInterval).reduce((acc, val) => acc + val, 0);
    flattenDataToInterval.datetime.push(newDatetime);
    flattenDataToInterval.open.push(newOpen);
    flattenDataToInterval.high.push(newHigh);
    flattenDataToInterval.low.push(newLow);
    flattenDataToInterval.close.push(newClose);
    flattenDataToInterval.volume.push(newVolume);
    elementsProcessed += flattenInterval;
  }
  return flattenDataToInterval;
};

/**
 * Represents the particular interval data as an array.
 * @typedef {Object} IntervalDataArray
 * @property {string} date - The date string in yyyy-mm-dd format.
 * @property {number[]} attributeValues - attribute values of mentioned attribute
 */

/**
 * Funtion to normalise the interval data of upstox response to single stock data type { datetime, open, close, high, low, volume }
 * @param {UpstoxStockDataAPIResponse[]} intervalDataArr
 * @returns {StockDataAttributesObject}
 */
export const normaliseData = (intervalDataArr) => {
  const attributes = {
    datetime: [],
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  };
  for (let row = 0; row < intervalDataArr.length; row += 1) {
    if (
      !(
        intervalDataArr[row][0] &&
        intervalDataArr[row][1] &&
        intervalDataArr[row][2] &&
        intervalDataArr[row][3] &&
        intervalDataArr[row][4] &&
        intervalDataArr[row][5]
      )
    )
      continue;
    attributes.datetime.push(intervalDataArr[row][0]);
    attributes.open.push(intervalDataArr[row][1]);
    attributes.high.push(intervalDataArr[row][2]);
    attributes.low.push(intervalDataArr[row][3]);
    attributes.close.push(intervalDataArr[row][4]);
    attributes.volume.push(intervalDataArr[row][5]);
  }
  const result = {
    datetime: attributes.datetime.at(-1),
    open: attributes.open.at(-1),
    close: attributes.close.at(0),
    high: Math.max(...attributes.high),
    low: Math.min(...attributes.low),
    volume: attributes.volume.reduce((acc, each) => acc + each, 0),
  };

  return result;
};

/**
 * Funtion to generate an array of objects which has date and stockData attributes for all the dates
 * @param {DateWiseDataObject} dateWiseStockData
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @returns {SingleDayDatabaseStockDataObject[]}
 */

export const getFlattenDataToIntervalV2 = (dateWiseStockData) => {
  const dayWiseData = Object.entries(dateWiseStockData);
  const flattenInterval = 5;
  const finalStructuredData = dayWiseData.map(([date, eachDayData]) => {
    const dayData = eachDayData;
    let elementsProcessed = 0;
    const completeDayDataAccToInterval = {
      datetime: [],
      open: [],
      close: [],
      high: [],
      low: [],
      volume: [],
    };
    if (dayData.length % flattenInterval !== 0) {
      const requiredElementsToMake = flattenInterval - (dayData.length % flattenInterval);
      dayData.push(...Array(requiredElementsToMake).fill([...Array(6).fill(null)]));
    }
    while (elementsProcessed < dayData.length) {
      const intervalData = dayData.slice(elementsProcessed, elementsProcessed + flattenInterval);
      const { datetime, open, close, high, low, volume } = normaliseData(intervalData);
      completeDayDataAccToInterval.datetime.push(datetime);
      completeDayDataAccToInterval.open.push(open);
      completeDayDataAccToInterval.high.push(high);
      completeDayDataAccToInterval.low.push(low);
      completeDayDataAccToInterval.close.push(close);
      completeDayDataAccToInterval.volume.push(volume);
      elementsProcessed += flattenInterval;
    }
    return {
      date,
      stockData: completeDayDataAccToInterval,
    };
  });
  return finalStructuredData;
};

export const getStcokList = (index) => {
  switch (index) {
    case INDEXES.nify500:
      return NIFTY_500;
    case 'test':
      return [NIFTY_500[0], NIFTY_500[477]];
    default:
      return null;
  }
};

/**
 * Function to calculate the the valid element from interval data for stock data attributes
 * @param {Array} intervalData - Array of interval data from recent to past
 * @param {string} attributeName - Should be one of DATA_ATTRIBUTES values
 * @returns {string | number}
 */
export const getValidAttributeValueFromIntervalData = (intervalData, attributeName) => {
  if (!intervalData || !Array.isArray(intervalData) || intervalData.length === 0) return null;
  switch (attributeName) {
    case DATA_ATTRIBUTES.datetime:
      return intervalData.at(-1);
    case DATA_ATTRIBUTES.open:
      return intervalData.at(-1);
    case DATA_ATTRIBUTES.high:
      return Math.max(...intervalData);
    case DATA_ATTRIBUTES.low:
      return Math.min(...intervalData);
    case DATA_ATTRIBUTES.close:
      return intervalData.at(0);
    case DATA_ATTRIBUTES.volume:
      return intervalData.reduce((acc, each) => acc + each, 0);
    default:
      return null;
  }
};

/**
 * Funtion to split the array in to subarrays of specified interval
 * @param {Array} arr - array
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @returns {Array} - array of interval array [[inteval.length], [inteval.length],...]
 */
export const splitArrayIntoSpecifiedIntervals = (arr, interval) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
  const reducedArray = [];
  const flatGap = getflatGap(interval);

  if (flatGap === FLAT_GAP.Five_Minute) {
    return arr;
  }
  const extraIntervalItemsCount = arr.length % flatGap;
  if (extraIntervalItemsCount) {
    reducedArray.push(arr.slice(0, extraIntervalItemsCount));
  }
  const remainingArray = arr.slice(extraIntervalItemsCount);
  for (let i = 0; i < remainingArray.length; i += flatGap) {
    reducedArray.push(remainingArray.slice(i, i + flatGap));
  }
  return reducedArray;
};

/**
 * Funtion to construct the new data array with new interval data
 * @param {SingleDayDatabaseStockDataObject[]} dateWiseDataArray
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @returns {SingleDayDatabaseStockDataObject[]} - Remains same data structure but with new interval data
 */
export const constructIntervalDataFromArray = (dateWiseDataArray, interval) => {
  if (!Array.isArray(dateWiseDataArray)) return null;
  if (interval === TIME_INTERVAL.Five_Minute) return dateWiseDataArray;
  const modifiedDateWiseDataArray = dateWiseDataArray.map((eachDayData) => {
    const { date, stockData } = eachDayData;
    const { datetime, close, open, high, low, volume } = stockData;
    const newDatetime = (() => {
      const res = splitArrayIntoSpecifiedIntervals(datetime, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.datetime);
      });
      return newIntervalData;
    })();
    const newOenPrices = (() => {
      const res = splitArrayIntoSpecifiedIntervals(open, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.open);
      });
      return newIntervalData;
    })();
    const newClosePrices = (() => {
      const res = splitArrayIntoSpecifiedIntervals(close, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.close);
      });
      return newIntervalData;
    })();
    const newHighPrices = (() => {
      const res = splitArrayIntoSpecifiedIntervals(high, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.high);
      });
      return newIntervalData;
    })();
    const newLowPrices = (() => {
      const res = splitArrayIntoSpecifiedIntervals(low, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.low);
      });
      return newIntervalData;
    })();
    const newVolumes = (() => {
      const res = splitArrayIntoSpecifiedIntervals(volume, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, DATA_ATTRIBUTES.volume);
      });
      return newIntervalData;
    })();
    return {
      date,
      stockData: {
        datetime: newDatetime,
        open: newOenPrices,
        high: newHighPrices,
        low: newLowPrices,
        close: newClosePrices,
        volume: newVolumes,
      },
    };
  });
  return modifiedDateWiseDataArray;
};

/**
 * Funtion to construct the new data array with new interval data for specified attribute
 * @param {SingleStockAttibuteResponse[]} dateWiseAttributeArray
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @param {string} attributeName - Should be one of DATA_ATTRIBUTES values
 * @returns {SingleStockAttibuteResponse[]} - Remains same data structure but with new interval data
 */
export const constructIntervalDataFromAttributeArray = (dateWiseAttributeArray, interval, attributeName) => {
  if (!Array.isArray(dateWiseAttributeArray)) return null;
  if (interval === TIME_INTERVAL.Five_Minute) return dateWiseAttributeArray;
  const modifiedDateWiseDataArray = dateWiseAttributeArray.map((eachDayData) => {
    const { date, attributeValues } = eachDayData;
    const newIntervalDataObj = (() => {
      const res = splitArrayIntoSpecifiedIntervals(attributeValues, interval);
      const newIntervalData = res.map((eachIntervalData) => {
        return getValidAttributeValueFromIntervalData(eachIntervalData, attributeName);
      });
      return newIntervalData;
    })();
    return {
      date,
      attributeValues: newIntervalDataObj,
    };
  });
  return modifiedDateWiseDataArray;
};

/**
 * Funtion to check for the correct time interval
 * @param {string} interval - Should be from TIME_INTERVAL values
 * @returns {boolean}
 */
export const isCorrectTimeInterval = (interval) => {
  const validTimeIntervals = Object.values(TIME_INTERVAL);
  if (validTimeIntervals.includes(interval)) {
    return true;
  }
  return false;
};

/**
 * Funtion to flatten the attribute array
 * @param {SingleStockAttibuteResponse[]} dateWiseAttributeArray
 * @returns {StockDataAttributesObject} - flatten the attribute data array
 */
export const getFlattenAttributeData = (dateWiseAttributeArray) => {
  if (!Array.isArray(dateWiseAttributeArray)) return null;
  const flattenAttibuteArray = dateWiseAttributeArray.reduce((acc, eachDayAttributeData) => {
    acc.push(...eachDayAttributeData.attributeValues);
    return acc;
  }, []);
  return flattenAttibuteArray;
};

/**
 * Funtion to flatten all stock attributes data into single object
 * @param {SingleDayDatabaseStockDataObject[]} dateWiseStockDataArray
 * @param {string[]} [attributesRequired] - Array of DATA_ATTRIBUTE values to return
 * @returns {StockDataAttributesObjectOptional} - flattening all stock attributes data into single object
 */
export const getFlattenStockData = (dateWiseStockDataArray, attributesRequired) => {
  let attributesArray = Object.values(DATA_ATTRIBUTES);
  const returnObj = {
    [DATA_ATTRIBUTES.datetime]: [],
    [DATA_ATTRIBUTES.open]: [],
    [DATA_ATTRIBUTES.high]: [],
    [DATA_ATTRIBUTES.low]: [],
    [DATA_ATTRIBUTES.close]: [],
    [DATA_ATTRIBUTES.volume]: [],
  };
  if (!Array.isArray(dateWiseStockDataArray) || dateWiseStockDataArray.length === 0) return null;
  if (Array.isArray(attributesRequired)) {
    attributesArray = attributesRequired;
  }
  const flattenStockData = dateWiseStockDataArray.reduce((acc, { stockData }) => {
    Object.entries(stockData).forEach(([attributeName, value]) => {
      if (attributesArray.includes(attributeName)) {
        acc[attributeName].push(...value);
      }
    });
    return acc;
  }, returnObj);

  const filteredFlattenStockData = Object.entries(flattenStockData).reduce((acc, [attributeName, value]) => {
    if (value.length > 0) {
      acc[attributeName] = value;
    }
    return acc;
  }, {});
  return filteredFlattenStockData;
};
