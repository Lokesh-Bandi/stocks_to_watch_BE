import { DB_STATUS, ERROR_MESSAGE } from '../constants/appConstants.js';
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
      const { status, ack } = await Promise.all(promiseQueue);
      res.json({
        status,
        ack,
      });
    } catch (e) {
      res.json({
        status: DB_STATUS.error,
        ack: `Error ocurred while updating instrumental codes: ${e} ${JSON.stringify(req.params)}`,
      });
    }
  },
  updateOneInstrumentalCode: async (req, res) => {
    try {
      const { stockExchangeCode } = req.params;
      const { ic } = req.body;
      console.log(ic);
      const stockCode = stockExchangeCode.toUpperCase();
      if (!isValidStockExchangeCode(stockCode)) {
        res.send(ERROR_MESSAGE.unknownStockCode);
        return;
      }
      if (!ic) {
        res.send(ERROR_MESSAGE.unknownInstrumentalCode);
        return;
      }
      const { status, ack } = await updateOneInstrumentalCodesDB(stockCode, ic);
      res.json({
        status,
        ack,
      });
    } catch (e) {
      res.json({
        status: DB_STATUS.error,
        ack: `Error ocurred while updating one instrumental codes: ${e} ${JSON.stringify(req.params)}`,
      });
    }
  },
};

export default metaDataController;
