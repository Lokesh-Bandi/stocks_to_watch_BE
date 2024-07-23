import { TechnicalIndicatorsModel } from '../database/schemas/TechnicalIndicatorsSchema.js';

export const updateRSIValueForStocks = async (arr) => {
  const allStocksRsiValues = Object.entries(arr);
  const promiseQueue = [];
  allStocksRsiValues.forEach(([stockExchangeCode, values]) => {
    const singleStockData = new TechnicalIndicatorsModel({
      stockExchangeCode,
      ta: {
        rsi: values,
      },
    });
    try {
      promiseQueue.push(singleStockData.save());
    } catch (e) {
      console.log(`Error updating document for the ${stockExchangeCode}`, e);
    }
  });
  try {
    const updationResult = await Promise.all(promiseQueue);
    updationResult.forEach((result, index) => {
      if (result instanceof Error) {
        console.error(`Document updation failed: ${allStocksRsiValues[index][0]} -- ${index}`, result.message);
      } else {
        console.log(`Document updation succeeded: ${allStocksRsiValues[index][0]} -- ${index}`);
      }
    });
  } catch (e) {
    console.log(`Error updating document`, e);
  }
};
