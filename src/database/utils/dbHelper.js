import { DATA_ATTRIBUTES, ERROR_MESSAGE, MAX_DAYS_DATA } from '../../constants/appConstants.js';
import { getInstrumentalCode } from '../../utils/utilFuntions.js';
import { HistoricalStockInfo } from '../models/HistoricalStockInfoModel.js';

import { completeStockDataQuery, isDataAvailableForTheDateQuery, stockAttributeFlattenQuery, stockAttributeQuery } from './queries.js';

/**
 * Funtion to fecth the history stock data collection document
 * @async
 * @param {string} stockExchangeCode
 * @returns {Promise<Object>} - Returns mongoDB document if exists or null
 */
export const findOneHistoryDataDocument = async (stockExchangeCode) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  try {
    const doc = await HistoricalStockInfo.findOne({ instrumentalCode });
    if (!doc) {
      console.log(ERROR_MESSAGE.documentNotFound);
      return null;
    }
    return doc;
  } catch (e) {
    console.log(ERROR_MESSAGE.mongoDBFetchingErrpr);
    return null;
  }
};

/**
 * Function to check if data exists for a particular date for a stock.
 * @async
 * @param {string} stockExchangeCode
 * @param {string} date - The date string in yyyy-mm-dd format.
 * @returns {Promise<boolean>}
 */

export const isDataAvailableForThisDate = async (stockExchangeCode, date) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  const query = isDataAvailableForTheDateQuery(instrumentalCode, date);
  try {
    const response = await HistoricalStockInfo.aggregate(query);
    const matchedData = response[0]?.matchedData;
    return matchedData.length > 0;
  } catch (e) {
    console.log(ERROR_MESSAGE.mongoDBFetchingErrpr);
    return false;
  }
};

/**
 * Funtion to fetch a stock atribute flatten values for mentioned no of days
 * @async
 * @param {string} stockExchangeCode
 * @param {string} attributeName - Should be one of the DATA_ATTRIBUTES values
 * @param {number} noOfDays - Data needed for mentioned no of days
 * @returns {Promise<number[]>}
 */

export const fetchCustomFlattenDataValuesDB = async (stockExchangeCode, attributeName, noOfDays) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) {
    console.log(ERROR_MESSAGE.unknownStockCode);
    return null;
  }
  if (!DATA_ATTRIBUTES[attributeName]) {
    console.log(ERROR_MESSAGE.unknowDataAttribute);
    return null;
  }
  try {
    const responseData = await HistoricalStockInfo.aggregate(stockAttributeFlattenQuery(instrumentalCode, attributeName, noOfDays));
    const attributeValues = responseData.length > 0 ? responseData[0].flattenedValues : [];
    return attributeValues;
  } catch (e) {
    console.log(`Error encountered while retrieving ${attributeName} stock data from a historical data collection document`, e);
    return [];
  }
};

/**
 * Represents a single stock attribute object.
 * @typedef {Object} SingleStockAttibuteResponse
 * @property {string} date - The date string in yyyy-mm-dd format.
 * @property {number[] | string[]} attributeValues - Attribute values for a specified attribute
 */

/**
 * Function to retrieve stock attribute values for a specified number of days.
 * @async
 * @param {string} stockExchangeCode
 * @param {string} attributeName - Should be one of the DATA_ATTRIBUTES values
 * @param {number} noOfDays - stock data to fetch for mentioned no of days
 * @returns {Promise<SingleStockAttibuteResponse[]>}
 */

export const fetchCustomDataValuesDB = async (stockExchangeCode, attributeName, noOfDays) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) {
    console.log(ERROR_MESSAGE.unknownStockCode);
    return null;
  }
  if (!DATA_ATTRIBUTES[attributeName]) {
    console.log(ERROR_MESSAGE.unknowDataAttribute);
    return null;
  }
  try {
    const responseData = await HistoricalStockInfo.aggregate(stockAttributeQuery(instrumentalCode, attributeName, noOfDays));
    return responseData;
  } catch (e) {
    console.log(`Error encountered while retrieving ${attributeName} stock data from a historical data collection document.`, e);
    return [];
  }
};

/**
 * Function to fetch stock data for a specified number of days.
 * @async
 * @param {string} stockExchangeCode
 * @param {number} [noOfDays] - Fetch stock data for a specified number of days
 * @returns {Promise<SingleStockAttibuteResponse[]>}
 */

export const fetchCompleteStockDataDB = async (stockExchangeCode, noOfDays = MAX_DAYS_DATA) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) {
    console.log(ERROR_MESSAGE.unknownStockCode);
    return null;
  }
  try {
    const responseData = await HistoricalStockInfo.aggregate(completeStockDataQuery(instrumentalCode, noOfDays));
    return responseData[0].data;
  } catch (e) {
    console.log(`Error encountered while retrieving stock data from a historical data collection document.`, e);
    return null;
  }
};
