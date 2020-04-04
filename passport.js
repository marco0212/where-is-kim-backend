import passport from 'passport';
import { Strategy } from 'passport-local';
import User from './model/user';

passport.use(new Strategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      console.log(err);
      return done(err);
    }
  }
));