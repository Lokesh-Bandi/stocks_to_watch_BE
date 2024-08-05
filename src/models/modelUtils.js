import { TECHNICAL_INDICATORS } from '../constants/appConstants.js';

import { updateMFIValueForStocks, updateRSIValueForStocks } from './technicalIndicatorsModel.js';

export const deriveTechIndicatorDBFuntion = (technicalIndicator) => {
  switch (technicalIndicator) {
    case TECHNICAL_INDICATORS.rsi:
      return updateRSIValueForStocks;
    case TECHNICAL_INDICATORS.mfi:
      return updateMFIValueForStocks;
    default:
      return null;
  }
};
