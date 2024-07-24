import mongoose from 'mongoose';

import { TIME_INTERVAL } from '../../constants/appConstants.js';

const timeIntervalObjectSchema = new mongoose.Schema(
  {
    [TIME_INTERVAL.Fifteen_Minute]: {
      type: Number,
      default: null,
    },
    [TIME_INTERVAL.Four_Hour]: {
      type: Number,
      default: null,
    },
    [TIME_INTERVAL.One_Day]: {
      type: Number,
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
  },
  { _id: false }
);

const technicalIndicatorsSchema = new mongoose.Schema({
  stockExchangeCode: {
    type: String,
    required: true,
    unique: true,
    lowercase: false,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  ta: {
    type: technicalIndicatorValues,
    required: true,
    default: null,
  },
});

export const TechnicalIndicatorsModel = mongoose.model('TechnicalIndicatorValues', technicalIndicatorsSchema);
