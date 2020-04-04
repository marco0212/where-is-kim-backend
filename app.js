import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const app = express();

import './db';
import './passport';

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.end('Hello?');
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    console.log(err, user);
    // if (err) {
    //   // Error handling
    // }

    // if (!user) {
    //   // Incorrect User
    // }
    if (err || !user) {
      return res.status(400).json({
          message: 'Something is not right',
          user   : user
      });
    }

    req.logIn(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign(user.toJSON(), 'your_jwt_secret');

      return res.json({ user, token });
    });
  });
});

module.exports = app;
