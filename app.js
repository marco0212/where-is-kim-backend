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

app.post('/api/auth/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      // Error handling
    }

    if (!user) {
      // Incorrect User
    }

    req.login(user, {session: false}, (err) => {
       if (err) return res.send(err);

       const token = jwt.sign(user.toJSON(), 'your_jwt_secret');

       return res.json({ token });
    });
  })(req, res);
});

module.exports = app;
