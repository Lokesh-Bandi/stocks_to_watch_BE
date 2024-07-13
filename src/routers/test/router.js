import express from 'express';

import { controller as MainController } from '../mainRouter/controller.js';

import { controller as TestController } from './controller.js';

const router = express.Router();

router.get('/:stockExchangeCode', MainController.test);

export default router;
