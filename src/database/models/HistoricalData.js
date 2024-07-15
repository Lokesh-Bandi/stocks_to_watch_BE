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
