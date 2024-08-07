import mongoose from 'mongoose';

const OHLCVDSchema = new mongoose.Schema(
  {
    datetime: {
      type: [String],
      required: true,
      default: [],
    },
    open: {
      type: [Number],
      required: true,
      default: [],
    },
    close: {
      type: [Number],
      required: true,
      default: [],
    },
    high: {
      type: [Number],
      required: true,
      default: [],
    },
    low: {
      type: [Number],
      required: true,
      default: [],
    },
    volume: {
      type: [Number],
      required: true,
      default: [],
    },
  },
  { _id: false }
);
const stockDataSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    stockData: {
      type: OHLCVDSchema,
      required: true,
    },
  },
  { _id: false }
);

const historicalStockInfo = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  instrumentalCode: {
    type: String,
    required: true,
    unique: true,
  },
  lastTradedPrice: {
    type: Number,
    required: true,
  },
  stockExchangeCode: {
    type: String,
    required: true,
  },
  data: {
    type: [stockDataSchema],
    required: true,
  },
});

export const HistoricalStockInfo = mongoose.model('HistoricalStockInfo', historicalStockInfo);
