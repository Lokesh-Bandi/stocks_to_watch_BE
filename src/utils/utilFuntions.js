import {
  FLAT_GAP,
  OPERATOR_NAME,
  TIME_INTERVAL,
} from '../constants/appConstants.js';
import { ISecCodes } from '../constants/isecCodes.js';

export const getOneMonthBackISO = (dateString) => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
};

export const getTwoMonthBackISO = (dateString) => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() - 2);
  return date.toISOString();
};

export const currentDateISO = () => {
  const date = new Date();
  date.setUTCHours(7, 0, 0, 0);
  return date.toISOString();
};

export const currentDateAndTimeISO = () => {
  const date = new Date();
  return date.toISOString();
};

export const getLast30DaysHistoricalData = (stockInfo) => {
  const last30DaysSize = 76 * 30;
  return stockInfo.slice(-last30DaysSize);
};

export const getISecStockCode = (stockName) => {
  return ISecCodes[stockName].isec_stock_code;
};

export const getCompanyName = (stockName) => {
  return ISecCodes[stockName].company_name;
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
    const flatValue = operator(
      ...arr.slice(elementsProcessed, elementsProcessed + flatGap)
    );
    flattedArr.push(flatValue);
    elementsProcessed += flatGap;
  }
  return flattedArr;
};

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
    case TIME_INTERVAL.One_Day:
      return FLAT_GAP.One_Day;
    default:
      return FLAT_GAP.Five_Minute;
  }
};
