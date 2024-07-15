import { HistoricalData } from '../database/models/HistoricalData.js';
import { getCompanyName, getInstrumentalCode } from '../utils/utilFuntions.js';

export const insertHistoricalData = async (stockExchangeCode, data) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  const companyName = getCompanyName(stockExchangeCode);
  const newHistoricalData = new HistoricalData({
    companyName,
    instrumentalCode,
    stockExchangeCode,
    data,
  });
  await newHistoricalData.save();
};
