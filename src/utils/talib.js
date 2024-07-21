import { RSI } from 'technicalindicators';

import { DATA_ATTRIBUTES, TIME_INTERVAL } from '../constants/appConstants.js';
import { fetchCustomDataValuesDB } from '../database/utils/dbHelper.js';

import { constructIntervalDataFromAttributeArray, getFlattenAttributeData } from './utilFuntions.js';

export const calculateRSI = async (stockExchangeCode, interval = TIME_INTERVAL.One_Day, timePeriod = 14) => {
  const fetchedData = await fetchCustomDataValuesDB(stockExchangeCode, DATA_ATTRIBUTES.close);

  console.log(fetchedData);

  const intervalClosingPrices = constructIntervalDataFromAttributeArray(fetchedData, interval, DATA_ATTRIBUTES.close);
  const closingPricesArray = getFlattenAttributeData(intervalClosingPrices);
  console.log(closingPricesArray);

  console.log(closingPricesArray.length);

  const rsiValues = RSI.calculate({ period: timePeriod, values: closingPricesArray });

  return rsiValues;
};
