import express from 'express';

import { connectBreeze } from '../../api/breezeAPI/breezeConnect.js';
import ROUTES from '../constants.js';
import loginRouter from '../login/router.js';
import signUpRouter from '../signup/router.js';

import MainController from './controller.js';

const mainRouter = express.Router();

mainRouter.use(`/${ROUTES.login}`, loginRouter);
mainRouter.use(`/${ROUTES.signUp}`, signUpRouter);

mainRouter.use('/', async (req, res, next) => {
  if (!global.breezeInstance) {
    connectBreeze();
  }
  next();
});
mainRouter.get('/', MainController.fetchStockCodes);

export default mainRouter;
