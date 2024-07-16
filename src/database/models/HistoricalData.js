import mongoose from 'mongoose';

const historicalDataSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  instrumentalCode: {
    type: String,
    required: true,
  },
  stockExchangeCode: {
    type: String,
    required: true,
  },
  data: {
    datetime: {
      type: [String],
      required: true,
    },
    open: {
      type: [Number],
      required: true,
    },
    close: {
      type: [Number],
      required: true,
    },
    high: {
      type: [Number],
      required: true,
    },
    low: {
      type: [Number],
      required: true,
    },
    volume: {
      type: [Number],
      required: true,
    },
  },
});

export const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

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
