import { findOneHistoryDataDocument } from '../database/utils/dbHelper.js';

export const insertTodayData = async (stockExchangeCode, { datetime, volume, open, close, high, low }) => {
  try {
    const doc = await findOneHistoryDataDocument(stockExchangeCode);
    if (!doc) {
      return;
    }
    doc.data.datetime = doc.data.datetime.slice(75);
    doc.data.volume = doc.data.volume.slice(75);
    doc.data.open = doc.data.open.slice(75);
    doc.data.close = doc.data.close.slice(75);
    doc.data.high = doc.data.high.slice(75);
    doc.data.low = doc.data.low.slice(75);

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
