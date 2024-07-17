import { DATA_ATTRIBUTES, ERROR_MESSAGE } from '../../constants/appConstants.js';
import { getInstrumentalCode } from '../../utils/utilFuntions.js';
import { HistoricalStockInfo } from '../models/HistoricalStockInfoModel.js';

import { isDataAvailableForTheDateQuery, stockAttributeFlattenQuery, stockAttributeQuery } from './queries.js';

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
 * Funtion to check whether the data existed for particular date for a stock
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

export const fetchCustomFlattenDataValues = async (stockExchangeCode, attributeName, noOfDays) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  if (!DATA_ATTRIBUTES[attributeName]) return ERROR_MESSAGE.unknowDataAttribute;
  try {
    const responseData = await HistoricalStockInfo.aggregate(stockAttributeFlattenQuery(instrumentalCode, attributeName, noOfDays));
    const attributeValues = responseData.length > 0 ? responseData[0].flattenedValues : [];
    return attributeValues;
  } catch (e) {
    console.log(`Error while fetching the ${attributeName} prices in an doc of history data collection`, e);
    return [];
  }
};

/**
 * Represents a single stock attribute object.
 * @typedef {Object} SingleStockAttibuteResponse
 * @property {string} date - The date string in yyyy-mm-dd format.
 * @property {number[]} attributeValues - attribute values of mentioned attribute
 */

/**
 * Funtion to fetch a stock atribute values according to date
 * @async
 * @param {string} stockExchangeCode
 * @param {string} attributeName - Should be one of the DATA_ATTRIBUTES values
 * @param {number} noOfDays - Data needed for mentioned no of days
 * @returns {Promise<SingleStockAttibuteResponse[]>}
 */

export const fetchCustomDataValues = async (stockExchangeCode, attributeName, noOfDays) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  if (!DATA_ATTRIBUTES[attributeName]) return ERROR_MESSAGE.unknowDataAttribute;
  try {
    const responseData = await HistoricalStockInfo.aggregate(stockAttributeQuery(instrumentalCode, attributeName, noOfDays));
    return responseData;
  } catch (e) {
    console.log(`Error while fetching the ${attributeName} prices in an doc of history data collection`, e);
    return [];
  }
};
