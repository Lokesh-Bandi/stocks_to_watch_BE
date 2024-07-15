import { RSI } from 'technicalindicators';

import { DATA_ATTRIBUTES, OPERATOR_NAME, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchCustomDataValues } from '../database/utils/dbHelper.js';

import { flatStockData, getflatGap } from './utilFuntions.js';

export const calculateRSI = async (stockExchangeCode, interval = TIME_INTERVAL.Five_Minute) => {
  const flatGap = getflatGap(interval);

  const fetchedData = await fetchCustomDataValues(stockExchangeCode, DATA_ATTRIBUTES.close);

  const closingPrices = flatStockData(fetchedData, flatGap, OPERATOR_NAME.min);

  const period = 14;

  console.log(closingPrices.length);

  const rsiValues = RSI.calculate({ period, values: closingPrices });

  return rsiValues;
};
