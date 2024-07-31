import express from 'express';

import historicalDataRouter from './historicalDataRouter.js';
import metaDataRouter from './metaDataRouter.js';
import { ROUTES } from './routes.js';
import stockDataRouter from './stockDataRouter.js';
import technicalIndicatorsRouter from './technicalIndicatorsRouter.js';
import testRouter from './testRouter.js';
import todaysDataRouter from './todaysDataRouter.js';

const mainRouter = express.Router();

mainRouter.use(`/${ROUTES.historicalData}`, historicalDataRouter);
mainRouter.use(`/${ROUTES.today}`, todaysDataRouter);
mainRouter.use(`/${ROUTES.test}`, testRouter);
mainRouter.use(`/${ROUTES.stockData}`, stockDataRouter);
mainRouter.use(`/${ROUTES.technicalIndicators}`, technicalIndicatorsRouter);
mainRouter.use(`/${ROUTES.meta}`, metaDataRouter);

mainRouter.get('/', (req, res) => {
  res.send('Welcome to the server!!');
});

export default mainRouter;
