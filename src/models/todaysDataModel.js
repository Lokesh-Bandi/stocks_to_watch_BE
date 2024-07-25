import { HistoricalStockInfo } from '../database/schemas/HistoricalStockInfoSchema.js';
import { getInstrumentalCode } from '../utils/utilFuntions.js';

const insertTodayDataDB = async ({ instrumentalCode, data }) => {
  const udpateStatus = await HistoricalStockInfo.updateOne(
    { instrumentalCode },
    {
      $push: {
        data: {
          $each: data,
          $position: 0,
        },
      },
    },
    { upsert: true } // Create a new document if no document matches
  );

  // Pop the 51st trading day data
  const poll = await HistoricalStockInfo.updateOne(
    { instrumentalCode },
    {
      $pop: {
        data: 1,
      },
    }
  );
  return udpateStatus;
};

export const insertTodayData = async (stockExchangeCode, todayData) => {
  const instrumentalCode = getInstrumentalCode(stockExchangeCode);
  const todayStockInfo = {
    instrumentalCode,
    data: todayData,
  };
  try {
    const acknowledge = await insertTodayDataDB(todayStockInfo);
    if (acknowledge.upsertedId) {
      console.log(`Successfully document created for the ${instrumentalCode}`);
    } else {
      console.log(`Successfully document updated for the ${instrumentalCode}`);
    }
  } catch (e) {
    console.log(`Error updating document for the ${instrumentalCode}`, e);
  }
};
