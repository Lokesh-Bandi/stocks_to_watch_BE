import mongoose from 'mongoose';

const instrumentalCodeSchema = new mongoose.Schema({
  stockExchangeCode: {
    type: String,
    unique: true,
    required: true,
  },
  instrumentalCode: {
    type: String,
    unique: true,
    required: true,
  },
});

export const InstrumentalCodeModel = mongoose.model('InstrumentalCode', instrumentalCodeSchema);
