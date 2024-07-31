import { ERROR_MESSAGE } from '../constants/appConstants.js';
import { updateOneInstrumentalCodesDB } from '../models/metaDataModel.js';
import { getInstrumentalCode, getStockList, isValidStockExchangeCode } from '../utils/utilFuntions.js';

const metaDataController = {
  updateAllInstrumentalCodes: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStockList(category);
      const promiseQueue = [];
      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }

      stockList.forEach((stockExchangeCode) => {
        const instrumentalCode = getInstrumentalCode(stockExchangeCode);
        promiseQueue.push(updateOneInstrumentalCodesDB(stockExchangeCode, instrumentalCode));
      });
      const dbResponse = await Promise.all(promiseQueue);
      res.json({ dbResponse });
    } catch (e) {
      res.json({
        message: `Error ocurred while updating instrumental codes: ${e} ${req.params}`,
      });
    }
  },
  updateOneInstrumentalCode: async (req, res) => {
    try {
      const { stockExchangeCode } = req.params;
      const { ic } = req.query;
      const stockCode = stockExchangeCode.toUpperCase();
      if (!isValidStockExchangeCode(stockCode)) res.send(ERROR_MESSAGE.unknownStockCode);
      if (!ic) res.send(ERROR_MESSAGE.unknownInstrumentalCode);

      const dbResponse = await updateOneInstrumentalCodesDB(stockCode, ic);
      res.json({ dbResponse });
    } catch (e) {
      res.json({
        message: `Error ocurred while updating one instrumental codes: ${e} ${req.params}`,
      });
    }
  },
};

export default metaDataController;
