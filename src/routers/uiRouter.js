import express from 'express';

import uiController from '../controllers/uiController.js';

const router = express.Router();

const routes = {
  ti_all: '/ti',
};

router.get('/', (req, res) => {
  res.send('<h1>UI Router</h1>');
});

// http://localhost:3000/ui/ti?ti=mfi
// http://localhost:3000/ui/ti?ti=rsi
router.get(routes.ti_all, uiController.fetchConsolidatedTechnicalIdicatorValues);

export default router;
