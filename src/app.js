import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';

import { connectDB } from './database/connections/connectDB.js';
import mainRouter from './routers/mainRouter.js';

const app = express();

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
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use('/', mainRouter);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port} port`);
});
