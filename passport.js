import passport from "passport";
import passportLocal from "passport-local";
import User from "./model/user";
import passportJwt from "passport-jwt";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    User.authenticate()
  )
);

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  })
);
