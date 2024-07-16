import { DATA_ATTRIBUTES, ERROR_MESSAGE, PRICE_ELEMENTS_PER_DAY_IN_DB } from '../../constants/appConstants.js';
import { getInstrumentalCode } from '../../utils/utilFuntions.js';
import { HistoricalData, HistoricalStockInfo } from '../models/HistoricalData.js';

import { isDataAvailableForTheDateQuery } from './queries.js';

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

export const fetchCustomDataValues = async (stockExchangeCode, customParam, noOfDays = 50) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);

  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  if (!DATA_ATTRIBUTES[customParam]) return ERROR_MESSAGE.unknowDataAttribute;

  const matchQuery = { instrumentalCode };
  const projection = {
    slicedItems: {
      $slice: [`$data.${customParam}`, -PRICE_ELEMENTS_PER_DAY_IN_DB * noOfDays],
    },
    _id: 0,
  };
  try {
    const responseData = await HistoricalData.aggregate([
      { $match: matchQuery }, // Filter based on array element
      { $project: projection }, // Project specific fields
    ]).exec();
    return responseData[0].slicedItems;
  } catch (e) {
    console.log(`Error while fetching the ${customParam} prices in an doc of history data collection`, e);
    return [];
  }
};
