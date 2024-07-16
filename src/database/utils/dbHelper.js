import { DATA_ATTRIBUTES, ERROR_MESSAGE } from '../../constants/appConstants.js';
import { getInstrumentalCode } from '../../utils/utilFuntions.js';
import { HistoricalStockInfo } from '../models/HistoricalStockInfoModel.js';

import { isDataAvailableForTheDateQuery, stockAttributeFlattenQuery, stockAttributeQuery } from './queries.js';

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

export const fetchCustomFlattenDataValues = async (stockExchangeCode, customParam, noOfDays) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  if (!DATA_ATTRIBUTES[customParam]) return ERROR_MESSAGE.unknowDataAttribute;
  try {
    const responseData = await HistoricalStockInfo.aggregate(stockAttributeFlattenQuery(instrumentalCode, customParam, noOfDays));
    const attributeValues = responseData.length > 0 ? responseData[0].flattenedValues : [];
    return attributeValues;
  } catch (e) {
    console.log(`Error while fetching the ${customParam} prices in an doc of history data collection`, e);
    return [];
  }
};

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
