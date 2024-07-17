import { MAX_DAYS_DATA } from '../constants/appConstants.js';
import { fetchCompleteStockDataDB, fetchCustomDataValuesDB, fetchCustomFlattenDataValuesDB } from '../database/utils/dbHelper.js';

const stockDataController = {
  fetchStockData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await (async () => {
      let data = null;
      if (!attributeName) {
        data = await fetchCompleteStockDataDB(stockCode, lastNDays);
        return data;
      }
      data = await fetchCustomDataValuesDB(stockCode, attributeName, lastNDays);
      return data;
    })();
    res.send(responseData);
  },
  fetchStockAttributeFlattenData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await fetchCustomFlattenDataValuesDB(stockCode, attributeName, lastNDays);
    res.send(responseData);
  },
};

export default stockDataController;
