import { DB_STATUS } from '../constants/appConstants.js';
import { HistoricalStockInfo } from '../database/schemas/HistoricalStockInfoSchema.js';

const insertTodayDataDB = async ({ instrumentalCode, data, lastNdays }) => {
  const udpateStatus = await HistoricalStockInfo.updateOne(
    { instrumentalCode },
    {
      $set: {
        lastTradedPrice: data[0].stockData.close[0],
      },
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
  await Array(lastNdays)
    .fill(0)
    .forEach(async () => {
      await HistoricalStockInfo.updateOne(
        { instrumentalCode },
        {
          $pop: {
            data: 1,
          },
        }
      );
    });
  return udpateStatus;
};

export const insertTodayData = async (instrumentalCode, todayData) => {
  const todayStockInfo = {
    instrumentalCode,
    data: todayData,
    lastNdays: 1,
  };
  try {
    const acknowledge = await insertTodayDataDB(todayStockInfo);
    if (acknowledge.upsertedId) {
      console.log(`Successfully document created for the ${instrumentalCode}`);
      return { status: DB_STATUS.created, ack: `Successfully document updated for the ${instrumentalCode}` };
    }
    console.log(`Successfully document updated for the ${instrumentalCode}`);
    return {
      status: DB_STATUS.updated,
      ack: `Successfully document updated for the ${instrumentalCode}`,
    };
  } catch (e) {
    console.log(`Error updating document for the ${instrumentalCode}`, e);
    return {
      status: DB_STATUS.error,
      ack: `Error updating document for the ${instrumentalCode} --> ${e}`,
    };
  }
};

export const insertLasDaysFromTodayData = async (instrumentalCode, todayData, lastNdays) => {
  const todayStockInfo = {
    instrumentalCode,
    data: todayData,
    lastNdays,
  };
  try {
    const acknowledge = await insertTodayDataDB(todayStockInfo);
    if (acknowledge.upsertedId) {
      console.log(`Successfully document created for the ${instrumentalCode}`);
      return { status: DB_STATUS.created, ack: `Successfully document updated for the ${instrumentalCode}` };
    }
    console.log(`Successfully document updated for the ${instrumentalCode}`);
    return {
      status: DB_STATUS.updated,
      ack: `Successfully document updated for the ${instrumentalCode}`,
    };
  } catch (e) {
    console.log(`Error updating document for the ${instrumentalCode}`, e);
    return {
      status: DB_STATUS.error,
      ack: `Error updating document for the ${instrumentalCode} --> ${e}`,
    };
  }
};
