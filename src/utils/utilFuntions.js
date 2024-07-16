import { INSTRUMENT_KEYS } from '../api/upstoxAPI/constants.js';
import { FLAT_GAP, INDEXES, OPERATOR_NAME, TIME_INTERVAL } from '../constants/appConstants.js';
import { NIFTY_500 } from '../constants/constants.js';

export const extractDateAndTime = (datetimeString) => {
  const datetime = new Date(datetimeString);
  const extractedDate = datetime.toISOString().split('T')[0];
  const extractedTime = datetime.toISOString().split('T')[1].split('+')[0];
  return { date: extractedDate, time: extractedTime };
};

export const extractMinutes = (datetimeString) => {
  const datetime = new Date(datetimeString);
  return datetime.getMinutes();
};

export const getLastNTradingDatesHistoricalData = (stockInfo, n = 50) => {
  const datesSet = new Set();
  const filteredDataForLastNTradingDates = {};

  for (let i = 0; i < stockInfo.length; i += 1) {
    const { date } = extractDateAndTime(stockInfo[i][0]);
    datesSet.add(date);
    if (datesSet.size === n + 1) {
      break;
    }
    if (!filteredDataForLastNTradingDates[date]) {
      filteredDataForLastNTradingDates[date] = [];
    }
    filteredDataForLastNTradingDates[date].push(stockInfo[i]);
  }

  return filteredDataForLastNTradingDates;
};

export const getLastNDaysHistoricalData = (stockInfo, n = 50) => {
  const last30DaysSize = 375 * n;
  return stockInfo.slice(0, last30DaysSize);
};

export const getInstrumentalCode = (stockName) => {
  return INSTRUMENT_KEYS[stockName]?.[0];
};

export const getCompanyName = (stockName) => {
  return INSTRUMENT_KEYS[stockName][1];
};

export const constructStructuredData = (data) => {
  const storingObject = {
    datetime: [],
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  };

  const structuredData = data.reduce((acc, eachIntervalData) => {
    acc.datetime.push(eachIntervalData.datetime);
    acc.open.push(eachIntervalData.open);
    acc.close.push(eachIntervalData.close);
    acc.high.push(eachIntervalData.high);
    acc.low.push(eachIntervalData.low);
    acc.volume.push(eachIntervalData.volume);
    return acc;
  }, storingObject);

  return structuredData;
};

export const filterData = (data) => {
  const exlcudeTime = '09:00:00';
  const filteredData = [];
  data.forEach((eachIntervalData) => {
    if (eachIntervalData.datetime.includes(exlcudeTime)) return;
    filteredData.push(eachIntervalData);
  });
  return filteredData;
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

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getCurrentDate = () => {
  const date = new Date();
  return formatDate(date);
};

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

export const getFlattenDataToIntervalV2 = (stockData, interval) => {
  const dayWiseData = Object.entries(stockData);
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
