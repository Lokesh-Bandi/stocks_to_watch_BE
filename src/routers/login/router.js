import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('login page');
  res.send('<h1>login Router</h1>');
});

export default router;
