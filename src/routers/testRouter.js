import express from 'express';

import mainController from '../controllers/mainController.js';

const router = express.Router();

router.get('/:stockExchangeCode', mainController.test);

export default router;
