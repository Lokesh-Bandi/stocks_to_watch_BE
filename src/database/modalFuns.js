import { getCompanyName, getISecStockCode } from '../utils/utilFuntions.js';

import { NewHistoricalData } from './schemas.js';

export const updateDBWithTodaysData = async (
  stockExchangeCode,
  { datetime, volume, open, close, high, low }
) => {
  const iSecStockCode = getISecStockCode(stockExchangeCode);
  try {
    // Find the document by the specified field
    const doc = await NewHistoricalData.findOne({ iSecStockCode });
    if (!doc) {
      console.error('Document not found');
      return;
    }
    doc.data.datetime = doc.data.datetime.slice(76);
    doc.data.volume = doc.data.volume.slice(76);
    doc.data.open = doc.data.open.slice(76);
    doc.data.close = doc.data.close.slice(76);
    doc.data.high = doc.data.high.slice(76);
    doc.data.low = doc.data.low.slice(76);

    doc.data.datetime.push(...datetime);
    doc.data.volume.push(...volume);
    doc.data.open.push(...open);
    doc.data.close.push(...close);
    doc.data.high.push(...high);
    doc.data.low.push(...low);

    // Save the updated document
    await doc.save();

    console.log('Successfully updated document:', doc);
  } catch (err) {
    console.error('Error updating document:', err);
  }
};

export const insertDBWithLast30DatysData = async (stockExchangeCode, data) => {
  const iSecStockCode = getISecStockCode(stockExchangeCode);
  const companyName = getCompanyName(stockExchangeCode);
  const newHistoricalData = new NewHistoricalData({
    companyName,
    iSecStockCode,
    stockExchangeCode,
    data,
  });
  await newHistoricalData.save();
};
