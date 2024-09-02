import { getUpstoxHistoricalData } from '../api/upstoxAPI/apiFuntions.js';
import { TECHNICAL_INDICATORS } from '../constants/appConstants.js';
import { fetchAllKeyStocksDB, fetchCoreDataForAllStocksDB, fetchTIForAllStocksDB } from '../database/utils/dbHelper.js';

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
    return dbResponseData.toJSON();
  } catch (e) {
    console.log('Error while fetching keyStocks', e);
    return null;
  }
};

export const fetchCoreDataForAllDB = async () => {
  try {
    const dbResponseData = await fetchCoreDataForAllStocksDB();
    return dbResponseData;
  } catch (e) {
    console.log('Error while fetching core data', e);
    return null;
  }
};

export const fetchStockData = async (instrumentalCode) => {
  try {
    const dbResponseData = await getUpstoxHistoricalData(instrumentalCode);
    const structuredData = dbResponseData.data.map((eachDayData) => {
      return {
        x: eachDayData[0],
        y: [eachDayData[1], eachDayData[2], eachDayData[3], eachDayData[4]],
      };
    });
    return structuredData;
  } catch (e) {
    console.log('Error while fetching core data', e);
    return null;
  }
};
