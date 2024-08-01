import { ERROR_MESSAGE, MAX_DAYS_DATA } from '../constants/appConstants.js';
import {
  fetchCompleteStockDataDB,
  fetchCustomDataValuesDB,
  fetchCustomFlattenDataValuesDB,
  fetchInstrumentalCodeForSpecificStockDB,
} from '../database/utils/dbHelper.js';

const stockDataController = {
  fetchStockData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
    if (!instrumentalCode) {
      res.send(ERROR_MESSAGE.unknownStockCode);
      return;
    }
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await (async () => {
      let data = null;
      if (!attributeName) {
        data = await fetchCompleteStockDataDB(instrumentalCode, lastNDays);
        return data;
      }
      data = await fetchCustomDataValuesDB(instrumentalCode, attributeName, lastNDays);
      return data;
    })();
    res.send(responseData);
  },
  fetchStockAttributeFlattenData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
    if (!instrumentalCode) {
      res.send(ERROR_MESSAGE.unknownStockCode);
      return;
    }
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await fetchCustomFlattenDataValuesDB(instrumentalCode, attributeName, lastNDays);
    res.send(responseData);
  },
};

export default stockDataController;
