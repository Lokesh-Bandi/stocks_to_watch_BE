import { ERROR_MESSAGE } from '../constants/appConstants.js';
import { findOneHistoryDataDocument } from '../database/utils/dbHelper.js';

export const insertTodayData = async (stockExchangeCode, todayData) => {
  try {
    const doc = await findOneHistoryDataDocument(stockExchangeCode);
    if (!doc) {
      return;
    }
    doc.data.pop();

    doc.data.unshift(...todayData);

    // Save the updated document
    await doc.save();

    console.log(ERROR_MESSAGE.documentInsertSuccess, stockExchangeCode);
  } catch (err) {
    console.error(ERROR_MESSAGE.documentUpdateError, err, stockExchangeCode);
  }
};
