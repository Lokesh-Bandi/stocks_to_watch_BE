import { HistoricalStockInfo } from '../database/models/HistoricalStockInfoModel.js';
import { getCompanyName, getInstrumentalCode } from '../utils/utilFuntions.js';

export const insertHistoricalData = async (stockExchangeCode, data) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  const companyName = getCompanyName(stockExchangeCode);
  const historicalStockInfo = new HistoricalStockInfo({
    companyName,
    instrumentalCode,
    stockExchangeCode,
    data,
  });
  try {
    await historicalStockInfo.save();
    console.log(`Successfully updated document for the ${instrumentalCode}`);
  } catch (e) {
    console.log(`Error updating document for the ${instrumentalCode}`);
  }
};
