import { EXCHANGE_CODE, TIME_INTERVAL } from '../../constants/appConstants.js';
import {
  currentDateAndTimeISO,
  currentDateISO,
  getTwoMonthBackISO,
} from '../../utils/utilFuntions.js';

export const getHistoricalData = async (
  stockName,
  interval = TIME_INTERVAL.Five_Minute
) => {
  const currentDate = currentDateISO();
  const fromDate = getTwoMonthBackISO(currentDate);

  const response = await globalThis.breezeInstance.getHistoricalDatav2({
    interval,
    fromDate,
    toDate: currentDate,
    stockCode: stockName,
    exchangeCode: EXCHANGE_CODE.NSE,
    productType: 'cash',
  });
  const response1 = await globalThis.breezeInstance.getHistoricalDatav2({
    interval,
    fromDate,
    toDate: response.Success[0].datetime,
    stockCode: stockName,
    exchangeCode: EXCHANGE_CODE.NSE,
    productType: 'cash',
  });
  const response2 = await globalThis.breezeInstance.getHistoricalDatav2({
    interval,
    fromDate,
    toDate: response1.Success[0].datetime,
    stockCode: stockName,
    exchangeCode: EXCHANGE_CODE.NSE,
    productType: 'cash',
  });
  return [
    ...response2.Success.slice(0, response2.Success.length - 1),
    ...response1.Success.slice(0, response1.Success.length - 1),
    ...response.Success,
  ];
};

export const getTodaysData = async (
  stockName,
  interval = TIME_INTERVAL.Five_Minute
) => {
  const fromDate = currentDateISO();
  const toDate = currentDateAndTimeISO();

  const response = await globalThis.breezeInstance.getHistoricalDatav2({
    interval,
    fromDate,
    toDate,
    stockCode: stockName,
    exchangeCode: EXCHANGE_CODE.NSE,
    productType: 'cash',
  });

  const data = response.Success ? [...EXCHANGE_CODE.response.Success] : [];
  return data;
};
