import mongoose from 'mongoose';

import { MONGOURL } from '../envs/environment.js';

export const connectDB = () => {
  mongoose
    .connect(MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB Atlas', err);
    });
};
