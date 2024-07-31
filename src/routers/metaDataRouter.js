import express from 'express';

import metaDataController from '../controllers/metaDataController.js';

const router = express.Router();

const routes = {
  allInstrumentCodes: '/ics/:grp',
  oneInstrumentalCode: '/ic/:stockExchangeCode',
};

router.get('/', (req, res) => {
  res.send('<h1>Meta Data Router</h1>');
});

// http://localhost:3000/meta/ic/RVNL?ic=NSE_EQ|INE415G01027
router.post(routes.oneInstrumentalCode, metaDataController.updateOneInstrumentalCode);
// http://localhost:3000/meta/ics/nifty500
router.post(routes.allInstrumentCodes, metaDataController.updateAllInstrumentalCodes);

export default router;
