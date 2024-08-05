import { TechnicalIndicatorsModel } from '../database/schemas/TechnicalIndicatorsSchema.js';
import { getCurrentDate } from '../utils/utilFuntions.js';

const updateRSIToDB = async (stockExchangeCode, rsiValues) => {
  const udpateStatus = await TechnicalIndicatorsModel.updateOne(
    { stockExchangeCode },
    { $set: { 'ta.rsi': rsiValues } },
    { upsert: true } // Create a new document if no document matches
  );
  return udpateStatus;
};

const updateMFIToDB = async (stockExchangeCode, mfiValues) => {
  const udpateStatus = await TechnicalIndicatorsModel.updateOne(
    { stockExchangeCode },
    { $set: { 'ta.mfi': mfiValues, lastUpdated: getCurrentDate() } },
    { upsert: true } // Create a new document if no document matches
  );
  return udpateStatus;
};
const updateALLTechnicalIndicatorsDB = async (arrOfStoringObjects) => {
  const structuredUpdateOperationArray = arrOfStoringObjects.map(({ stockExchangeCode, tiValues }) => {
    return {
      updateOne: {
        filter: {
          stockExchangeCode,
        },
        update: {
          $set: {
            ta: tiValues,
          },
        },
        upsert: true,
      },
    };
  });
  const udpateStatus = await TechnicalIndicatorsModel.bulkWrite(structuredUpdateOperationArray);
  return udpateStatus;
};

export const updateALLTechnicalIndicators = async (arrOfStoringObjects) => {
  try {
    const updationResult = await updateALLTechnicalIndicatorsDB(arrOfStoringObjects);
    console.log(updationResult);
    return updationResult;
  } catch (e) {
    console.log('Error updating all technical indicator values', e);
    return null;
  }
};

export const updateRSIValueForStocks = async (arr) => {
  const allStocksRsiValues = Object.entries(arr);
  const promiseQueue = [];
  try {
    allStocksRsiValues.forEach(async ([stockExchangeCode, values]) => {
      promiseQueue.push(updateRSIToDB(stockExchangeCode, values));
    });
    const updationResult = await Promise.all(promiseQueue);
    updationResult.forEach((result, index) => {
      if (result instanceof Error) {
        console.error(`Document updation failed: ${allStocksRsiValues[index][0]} -- ${index}`, result.message);
      } else if (result.upsertedId) {
        console.log(`Document creation succeeded: ${allStocksRsiValues[index][0]} -- ${index}`);
      } else {
        console.log(`Document updation succeeded: ${allStocksRsiValues[index][0]} -- ${index}`);
      }
    });
  } catch (e) {
    console.log(`Error updating document`, e);
  }
};

export const updateMFIValueForStocks = async (arr) => {
  const allStocksRsiValues = Object.entries(arr);
  const promiseQueue = [];
  try {
    allStocksRsiValues.forEach(async ([stockExchangeCode, values]) => {
      promiseQueue.push(updateMFIToDB(stockExchangeCode, values));
    });
    const updationResult = await Promise.all(promiseQueue);
    updationResult.forEach((result, index) => {
      if (result instanceof Error) {
        console.error(`Document updation failed: ${allStocksRsiValues[index][0]} -- ${index}`, result.message);
      } else if (result.upsertedId) {
        console.log(`Document creation succeeded: ${allStocksRsiValues[index][0]} -- ${index}`);
      } else {
        console.log(`Document updation succeeded: ${allStocksRsiValues[index][0]} -- ${index}`);
      }
    });
  } catch (e) {
    console.log(`Error updating document`, e);
  }
};
