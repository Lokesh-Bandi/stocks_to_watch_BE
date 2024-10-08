import mongoose, { Schema } from 'mongoose';

import { STOCK_MARKET_MOVEMENT, TIME_INTERVAL } from '../../constants/appConstants.js';

const timeIntervalObjectSchema = new mongoose.Schema(
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
  { _id: false }
);
const technicalIndicatorValues = new mongoose.Schema(
  {
    rsi: {
      type: timeIntervalObjectSchema,
      default: null,
    },
    mfi: {
      type: timeIntervalObjectSchema,
      default: null,
    },
    bollingerbands: {
      type: timeIntervalObjectSchema,
      default: null,
    },
    volumeSpike: {
      type: timeIntervalObjectSchema,
      default: null,
    },
  },
  { _id: false }
);

const CandlestickPattternsSchema = new mongoose.Schema(
  {
    bullish: {
      type: [String],
      default: null,
    },
    bearish: {
      type: [String],
      default: null,
    },
  },
  {
    _id: false,
  }
);
const technicalIndicatorsSchema = new mongoose.Schema({
  stockExchangeCode: {
    type: String,
    required: true,
    unique: true,
    lowercase: false,
  },
  lastUpdated: {
    type: String,
    required: true,
    default: null,
  },
  ta: {
    type: technicalIndicatorValues,
    required: true,
    default: null,
  },
  momentum: {
    type: String,
    default: STOCK_MARKET_MOVEMENT.neutral,
  },
  candlestickPattterns: {
    type: CandlestickPattternsSchema,
    required: true,
    default: null,
  },
});

export const TechnicalIndicatorsModel = mongoose.model('TechnicalIndicatorValues', technicalIndicatorsSchema);
