const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

import './db';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.end('Hello?');
});

module.exports = app;
