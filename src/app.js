import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';

import mainRouter from './routers/mainRouter/router.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(express.json());
app.use('/', mainRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port`);
});
