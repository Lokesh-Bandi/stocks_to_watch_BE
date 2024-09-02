import { DATA_ATTRIBUTES, ERROR_MESSAGE, MAX_DAYS_DATA } from '../../constants/appConstants.js';
import { HistoricalStockInfo } from '../schemas/HistoricalStockInfoSchema.js';
import { InstrumentalCodeModel } from '../schemas/InstrumentalCodeSchema.js';
import { KeyStocksModel } from '../schemas/KeyStocksSchema.js';
import { TechnicalIndicatorsModel } from '../schemas/TechnicalIndicatorsSchema.js';

import {
  candlestickPattternsQuery,
  completeStockDataQuery,
  coreDataQuery,
  instrumentalCodeForSpecificStockQuery,
  instrumentalCodesQuery,
  isDataAvailableForTheDateQuery,
  rsiForAllQuery,
  stockAttributeFlattenQuery,
  stockAttributeQuery,
} from './queries.js';

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
 * history_stock_info collection document data attribute represents array of below object
 * @typedef {Object} SingleDayDatabaseStockDataObject
 * @property {string} date - date in the format of YYYY-MM-DD
 * @property {StockDataAttributesObject} stockData
 */

/**
 * Funtion to fetch the history stock data collection document
 * @async
 * @param {string} stockExchangeCode
 * @returns {Promise<Object>} - Returns mongoDB document if exists or null
 */
export const findOneHistoryDataDocument = async (stockExchangeCode) => {
  try {
    const doc = await HistoricalStockInfo.findOne({ stockExchangeCode });
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
 * Funtion to fetch the technical indicator collection document
 * @async
 * @param {string} stockExchangeCode
 * @returns {Promise<Object>} - Returns mongoDB document if exists or null
 */
export const findOneTechincalIndicatorDocument = async (stockExchangeCode) => {
  if (!stockExchangeCode) {
    console.log(ERROR_MESSAGE.unknownStockCode);
    return null;
  }
  try {
    const doc = await TechnicalIndicatorsModel.findOne({ stockExchangeCode });
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
 * @param {string} instrumentalCode
 * @param {string} date - The date string in yyyy-mm-dd format.
 * @returns {Promise<boolean>}
 */

export const isDataAvailableForThisDate = async (instrumentalCode, date) => {
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
 * @param {string} instrumentalCode
 * @param {string} attributeName - Should be one of the DATA_ATTRIBUTES values
 * @param {number} noOfDays - Data needed for mentioned no of days
 * @returns {Promise<number[]>}
 */

export const fetchCustomFlattenDataValuesDB = async (instrumentalCode, attributeName, noOfDays) => {
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
 * @param {string} instrumentalCode
 * @param {string} attributeName - Should be one of the DATA_ATTRIBUTES values
 * @param {number} noOfDays - stock data to fetch for mentioned no of days
 * @returns {Promise<SingleStockAttibuteResponse[]>}
 */

export const fetchCustomDataValuesDB = async (instrumentalCode, attributeName, noOfDays) => {
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
 * @param {string} instrumentalCode
 * @param {number} [noOfDays] - Fetch stock data for a specified number of days
 * @returns {Promise<SingleDayDatabaseStockDataObject[]>}
 */

export const fetchCompleteStockDataDB = async (instrumentalCode, noOfDays = MAX_DAYS_DATA) => {
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

export const fetchTIForAllStocksDB = async (technicalIndicator) => {
  try {
    const responseData = await TechnicalIndicatorsModel.aggregate(rsiForAllQuery(technicalIndicator));
    return responseData;
  } catch (e) {
    console.log('Error while querying RSI values', e);
    return null;
  }
};

export const fetchInstrumentalCodesDB = async () => {
  try {
    const responseData = await InstrumentalCodeModel.aggregate(instrumentalCodesQuery()).exec();
    const instrumentalCodesArray = responseData.length > 0 ? responseData : null;
    const instrumentalCodesObject = instrumentalCodesArray.reduce((acc, eachStock) => {
      acc[eachStock.stockExchangeCode] = eachStock.instrumentalCode;
      return acc;
    }, {});
    return instrumentalCodesObject;
  } catch (e) {
    console.log('Error while querying instrumental codes', e);
    return null;
  }
};

export const fetchInstrumentalCodeForSpecificStockDB = async (stockExchangeCode) => {
  try {
    const responseData = await InstrumentalCodeModel.aggregate(instrumentalCodeForSpecificStockQuery(stockExchangeCode));
    const instrumentalCode = responseData.length > 0 ? responseData[0].instrumentalCode : null;
    return instrumentalCode;
  } catch (e) {
    console.log(`Error while querying instrumental code for ${stockExchangeCode}`, e);
    return null;
  }
};

export const fetchAllKeyStocksDB = async () => {
  try {
    const responseData = await KeyStocksModel.findOne({}, { _id: 0, __v: 0 });
    return responseData ?? null;
  } catch (e) {
    console.log('Error while fetching keyStocks', e);
    return null;
  }
};

export const fetchCoreDataForAllStocksDB = async () => {
  try {
    const responseData = await HistoricalStockInfo.aggregate(coreDataQuery());
    return responseData ?? null;
  } catch (e) {
    console.log('Error while fetching core data', e);
    return null;
  }
};

export const fetchCandlestickPatterns = async () => {
  try {
    const responseData = await TechnicalIndicatorsModel.aggregate(candlestickPattternsQuery());
    return responseData ?? null;
  } catch (e) {
    console.log('Error while fetching momentum stocks', e);
    return null;
  }
};
