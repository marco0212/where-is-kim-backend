import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from './model/user';

const app = express();

import './db';
import './passport';

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      return res.end('Error');
    }

    if (!user) {
      return res.end('Wrong User');
    }

    req.login(user, { session: false }, (err) => {
       if (err) return res.send(err);

       const payload = { id: user.id };
       const token = jwt.sign(payload, 'your_jwt_secret');

       return res.json({ token });
    });
  })(req, res);
});

app.post('/api/auth/signup', async (req, res) => {
  const {
    username,
    email,
    profilePic,
    password,
    confirmPassword
  } = req.body;

  try {
    const user = new User({
      username,
      email,
      profilePic
    });

    await User.register(user, password);

    res.json({ result: 'ok' });
  } catch (error) {
    return res.json({ result: 'error', error });
  }
});

module.exports = app;
