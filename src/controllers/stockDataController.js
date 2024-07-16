import { MAX_DAYS_DATA } from '../constants/appConstants.js';
import { fetchCustomDataValues, fetchCustomFlattenDataValues } from '../database/utils/dbHelper.js';

const stockDataController = {
  fetchStockAttributeData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await fetchCustomDataValues(stockCode, attributeName, lastNDays);
    res.send(responseData);
  },
  fetchStockAttributeFlattenData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { attributeName, noOfDays } = req.query;
    const lastNDays = noOfDays ? parseInt(noOfDays) : MAX_DAYS_DATA;
    const responseData = await fetchCustomFlattenDataValues(stockCode, attributeName, lastNDays);
    res.send(responseData);
  },
};

export default stockDataController;
