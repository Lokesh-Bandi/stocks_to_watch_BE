import { ERROR_MESSAGE, TECHNICAL_INDICATORS } from '../constants/appConstants.js';
import { fetchMomentumStocks, fetchTIForAllStocksDB } from '../database/utils/dbHelper.js';
import { constructUIResponseObjectForRSI, fetchAllKeyStocksFromDB, fetchCoreDataForAllDB } from '../models/uiModel.js';
import { sortBollingerBandsStocks, sortMfiKeyStocks, sortRsiKeyStocks } from '../utils/talibUtils.js';

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
  fetchAllKeyStocks: async (req, res) => {
    const keyStocks = await fetchAllKeyStocksFromDB();
    if (!keyStocks) return res.json(null);
    const sortedRsi = sortRsiKeyStocks(keyStocks.rsi);
    const sortedMfi = sortMfiKeyStocks(keyStocks.mfi);
    const sortedBollingerBands = sortBollingerBandsStocks(keyStocks.bollingerbands);
    const sortedObj = {
      ...keyStocks,
      rsi: sortedRsi,
      mfi: sortedMfi,
      bollingerbands: sortedBollingerBands,
    };
    res.send(sortedObj);
  },
  fetchCoreDataForAllStocks: async (req, res) => {
    const coreData = await fetchCoreDataForAllDB();
    if (!coreData) return res.json(null);
    const structuredResponseData = coreData.reduce((acc, eachStockData) => {
      const { stockExchangeCode, companyName, lastTradedPrice } = eachStockData;
      acc[stockExchangeCode] = {
        companyName,
        lastTradedPrice,
      };
      return acc;
    }, {});
    res.json(structuredResponseData);
  },
  fetchMomentumStocks: async (req, res) => {
    const momentumStocks = await fetchMomentumStocks();
    if (!momentumStocks) return res.json(null);
    const structuredResponseData = momentumStocks.reduce((acc, eachStockData) => {
      const { stockExchangeCode, momentum } = eachStockData;
      acc[stockExchangeCode] = momentum;
      return acc;
    }, {});
    res.json(structuredResponseData);
  },
};

export default uiController;
