import { ERROR_MESSAGE, TECHNICAL_INDICATORS } from '../constants/appConstants.js';
import { fetchTIForAllStocksDB } from '../database/utils/dbHelper.js';
import { constructUIResponseObjectForRSI } from '../models/uiModel.js';

const uiController = {
  fetchConsolidatedTechnicalIdicatorValues: async (req, res) => {
    const { ti } = req.query;
    const technicalIndicator = ti.toUpperCase();
    let responseData;
    if (!technicalIndicator) {
      res.send(ERROR_MESSAGE.unknownTechIndicator);
      return;
    }
    switch (technicalIndicator) {
      case TECHNICAL_INDICATORS.rsi:
        responseData = await constructUIResponseObjectForRSI();
        break;
      case TECHNICAL_INDICATORS.mfi:
        responseData = await fetchTIForAllStocksDB(technicalIndicator);
        break;
      default:
        responseData = null;
    }
    res.json({ responseData });
  },
};

export default uiController;
