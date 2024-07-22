import { TECHNICAL_INDICATORS, TIME_INTERVAL } from '../constants/appConstants.js';
import { calculateMFI, calculateRSI } from '../utils/talib.js';
import { isCorrectTimeInterval } from '../utils/utilFuntions.js';

const technicalIndicatorsController = {
  fetchTechnicalIndicatorValue: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const { ti, interval, timePeriod } = req.query;
    const technicalIndicator = ti.toUpperCase();
    const timeInterval = isCorrectTimeInterval(interval) ? interval : TIME_INTERVAL.One_Day;
    let technicalIndicatorResponse;
    switch (technicalIndicator) {
      case TECHNICAL_INDICATORS.rsi:
        technicalIndicatorResponse = await calculateRSI(stockCode, timeInterval, timePeriod);
        break;
      case TECHNICAL_INDICATORS.mfi:
        technicalIndicatorResponse = await calculateMFI(stockCode, timeInterval, timePeriod);
        break;
      default:
        technicalIndicatorResponse = null;
    }
    res.send(technicalIndicatorResponse);
  },
};

export default technicalIndicatorsController;
