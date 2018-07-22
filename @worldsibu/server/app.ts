// @ts-check

import * as dotenv from 'dotenv';
import * as express from 'express';
import { Router } from 'express';
import * as bodyParser from 'body-parser';
import { DrugCtrl } from './controllers';

dotenv.config();

const app: express.Application = express();
const port = process.env.PORT || 10010;
const config = { appRoot: __dirname };

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '40mb'
}));

app.use(bodyParser.json({ limit: '40mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/drug', DrugCtrl);

app.listen(port, () =>
  console.log('Running in port  %d', port));

module.exports = app;