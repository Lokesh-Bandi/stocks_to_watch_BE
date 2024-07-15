import { RSI } from 'technicalindicators';

import { OPERATOR_NAME, TIME_INTERVAL } from '../constants/appConstants.js';
import { getRSIDbValues } from '../database/utils/dbHelper.js';

import { flatStockData, getflatGap } from './utilFuntions.js';

export const getRSI = async (stockExchangeCode, interval = TIME_INTERVAL.Five_Minute) => {
  const flatGap = getflatGap(interval);

  const fetchedData = await getRSIDbValues(stockExchangeCode);

  const closingPrices = flatStockData(fetchedData, flatGap, OPERATOR_NAME.min);

  const period = 14;

  console.log(closingPrices.length);

  const rsiValues = RSI.calculate({ period, values: closingPrices });

  return rsiValues;
};
