import { TECHNICAL_INDICATORS } from '../constants/appConstants.js';
import { fetchAllKeyStocksDB, fetchTIForAllStocksDB } from '../database/utils/dbHelper.js';

export const constructUIResponseObjectForRSI = async () => {
  try {
    const dbResponseData = await fetchTIForAllStocksDB(TECHNICAL_INDICATORS.rsi);
    return dbResponseData;
  } catch (e) {
    console.log('Error while fetching the RSI value', e);
    return null;
  }
};

export const fetchAllKeyStocksFromDB = async () => {
  try {
    const dbResponseData = await fetchAllKeyStocksDB();
    return dbResponseData;
  } catch (e) {
    console.log('Error while fetching keyStocks', e);
    return null;
  }
};
