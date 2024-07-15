import express from 'express';

import historicalDataRouter from './historicalDataRouter.js';
import ROUTES from './rotues.js';
import testRouter from './testRouter.js';

const mainRouter = express.Router();

mainRouter.use(`/${ROUTES.historicalData}`, historicalDataRouter);
mainRouter.use(`/${ROUTES.test}`, testRouter);

mainRouter.get('/', (req, res) => {
  res.send('Welcome to the server!!');
});

export default mainRouter;
