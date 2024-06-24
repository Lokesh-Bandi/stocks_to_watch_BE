import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('sign up page');
  res.send('<h1>signup Router</h1>');
});

export default router;
