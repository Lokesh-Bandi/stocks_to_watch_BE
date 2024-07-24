import { HistoricalStockInfo } from '../database/schemas/HistoricalStockInfoSchema.js';
import { getCompanyName, getInstrumentalCode } from '../utils/utilFuntions.js';

const insertHistoricalDataDB = async ({ companyName, instrumentalCode, stockExchangeCode, data }) => {
  const udpateStatus = await HistoricalStockInfo.updateOne(
    { stockExchangeCode },
    { $set: { companyName, instrumentalCode, stockExchangeCode, data } },
    { upsert: true } // Create a new document if no document matches
  );
  return udpateStatus;
};
export const insertHistoricalData = async (stockExchangeCode, data) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  const companyName = getCompanyName(stockExchangeCode);
  const historicalStockInfo = {
    companyName,
    instrumentalCode,
    stockExchangeCode,
    data,
  };
  try {
    const acknowledge = await insertHistoricalDataDB(historicalStockInfo);
    if (acknowledge.upsertedId) {
      console.log(`Successfully document created for the ${instrumentalCode}`);
    } else {
      console.log(`Successfully document updated for the ${instrumentalCode}`);
    }
  } catch (e) {
    console.log(`Error updating document for the ${instrumentalCode}`);
  }
};
