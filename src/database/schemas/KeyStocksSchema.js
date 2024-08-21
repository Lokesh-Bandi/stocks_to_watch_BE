import mongoose, { Schema } from 'mongoose';

import { TIME_INTERVAL } from '../../constants/appConstants.js';

const intervalSchema = new mongoose.Schema(
  {
    [TIME_INTERVAL.Fifteen_Minute]: {
      type: Schema.Types.Mixed,
      default: null,
    },
    [TIME_INTERVAL.Four_Hour]: {
      type: Schema.Types.Mixed,
      default: null,
    },
    [TIME_INTERVAL.One_Day]: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    _id: false,
  }
);
const keyStocksSchema = new mongoose.Schema({
  rsi: {
    type: intervalSchema,
    default: null,
    unique: true,
  },
  mfi: {
    type: intervalSchema,
    default: null,
    unique: true,
  },
  bollingerbands: {
    type: intervalSchema,
    default: null,
    unique: true,
  },
  volumeSpike: {
    type: intervalSchema,
    default: null,
    unique: true,
  },
  lastUpdated: {
    type: String,
    required: true,
    default: null,
  },
});

export const KeyStocksModel = mongoose.model('keyStocks', keyStocksSchema);
