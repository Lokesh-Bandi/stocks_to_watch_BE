import { getInstrumentalCode } from '../utils/utilFuntions.js';

import { NewHistoricalData } from './schemas.js';

export const getRSIDbValues = async (stockExchangeCode) => {
  const stockCode = getInstrumentalCode(stockExchangeCode);
  const query = { stockCode };
  const projection = { 'data.close': 1, _id: 0 };

  const {
    data: { close },
  } = await NewHistoricalData.findOne(query, projection);

  return close;
};
