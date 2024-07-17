import { INSTRUMENT_KEYS } from '../api/upstoxAPI/constants.js';
import { FLAT_GAP, INDEXES, OPERATOR_NAME, TIME_INTERVAL } from '../constants/appConstants.js';
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
    case TIME_INTERVAL.One_Minute:
      return FLAT_GAP.One_Minute;
    case TIME_INTERVAL.Five_Minute:
      return FLAT_GAP.Five_Minute;
    case TIME_INTERVAL.Ten_Minute:
      return FLAT_GAP.Ten_Minute;
    case TIME_INTERVAL.Fifteen_Minute:
      return FLAT_GAP.Fifteen_Minute;
    case TIME_INTERVAL.Thirty_Minute:
      return FLAT_GAP.Thirty_Minute;
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

export const getFlattenDataToIntervalV2 = (dateWiseStockData, interval) => {
  const dayWiseData = Object.entries(dateWiseStockData);
  const flattenInterval = getflatGap(interval);
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
    default:
      return null;
  }
};
