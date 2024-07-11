import mongoose from 'mongoose';

const stockDataSchema = new mongoose.Schema({
  datetime: {
    type: String,
    required: true,
  },
  open: {
    type: Number,
    required: true,
  },
  close: {
    type: Number,
    required: true,
  },
  high: {
    type: Number,
    required: true,
  },
  low: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  },
});

export const StockData = mongoose.model('StockData', stockDataSchema);

const historicalDataSchema = new mongoose.Schema({
  data: [
    {
      datetime: {
        type: String,
        required: true,
      },
      open: {
        type: Number,
        required: true,
      },
      close: {
        type: Number,
        required: true,
      },
      high: {
        type: Number,
        required: true,
      },
      low: {
        type: Number,
        required: true,
      },
      volume: {
        type: Number,
        required: true,
      },
    },
  ],
});

export const HistoricalData = mongoose.model(
  'HistoricalData',
  historicalDataSchema
);

const newHistoricalDataSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  iSecStockCode: {
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

export const NewHistoricalData = mongoose.model(
  'NewHistoricalData',
  newHistoricalDataSchema
);

const sample = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: {
    type: [Number],
    required: true,
  },
});

export const Sample = mongoose.model('Sample', sample);
