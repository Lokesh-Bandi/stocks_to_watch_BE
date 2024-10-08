import { ERROR_MESSAGE, TECHNICAL_INDICATORS } from '../constants/appConstants.js';
import { fetchCandlestickPatterns, fetchInstrumentalCodeForSpecificStockDB, fetchTIForAllStocksDB } from '../database/utils/dbHelper.js';
import { constructUIResponseObjectForRSI, fetchAllKeyStocksFromDB, fetchCoreDataForAllDB, fetchStockData } from '../models/uiModel.js';
import { sortBollingerBandsStocks, sortedVolumeSpikeStocks, sortMfiKeyStocks, sortRsiKeyStocks } from '../utils/talibUtils.js';
import { getMomentumStaus, getPatternsFollowed } from '../utils/utilFuntions.js';

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
    const sortedVolumeSpikes = sortedVolumeSpikeStocks(keyStocks.volumeSpike);
    const sortedObj = {
      ...keyStocks,
      rsi: sortedRsi,
      mfi: sortedMfi,
      bollingerbands: sortedBollingerBands,
      volumeSpike: sortedVolumeSpikes,
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
    const candlestickPattternsStocks = await fetchCandlestickPatterns();
    if (!candlestickPattternsStocks) return res.json(null);
    const structuredResponseData = candlestickPattternsStocks.reduce((acc, eachStockData) => {
      const { stockExchangeCode, candlestickPattterns } = eachStockData;
      acc[stockExchangeCode] = {
        momentum: getMomentumStaus(candlestickPattterns),
        patternsFollowed: getPatternsFollowed(candlestickPattterns),
      };
      return acc;
    }, {});
    res.json(structuredResponseData);
  },
  fetchStockData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    try {
      const instrumentalCode = await fetchInstrumentalCodeForSpecificStockDB(stockCode);
      if (!instrumentalCode) {
        res.send(ERROR_MESSAGE.unknownStockCode);
      }
      const stockData = await fetchStockData(instrumentalCode);
      res.json(stockData);
    } catch (e) {
      console.log('Error while fetching stock data');
      res.json(null);
    }
  },
};

export default uiController;
