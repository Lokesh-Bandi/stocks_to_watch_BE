import { DATA_ATTRIBUTES, ERROR_MESSAGE, PRICE_ELEMENTS_PER_DAY_IN_DB } from '../../constants/appConstants.js';
import { getInstrumentalCode } from '../../utils/utilFuntions.js';
import { HistoricalData } from '../models/HistoricalData.js';

export const findOneHistoryDataDocument = async (stockExchangeCode) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  if (!instrumentalCode) return ERROR_MESSAGE.unknownStockCode;
  try {
    const doc = await HistoricalData.findOne({ instrumentalCode });
    if (!doc) {
      console.error('Document not found');
      return null;
    }
    return doc;
  } catch (e) {
    console.log('Error while finding the doc in history data collection');
    return null;
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
