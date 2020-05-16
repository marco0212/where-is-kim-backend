import passport from "passport";
import User from '../model/user';
import jwt from "jsonwebtoken";
import { CustomError } from "../lib/error";

export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        throw new CustomError(403, "User does not exists");
      }

      user = await User.findById(user.id).populate("teams");

      req.login(user, { session: false }, (err) => {
        if (err) return next(err);

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return res.json({ result: { token, user } });
      });
    } catch (error) {
      next(error);
    }
  })(req, res);
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const profile = req.file ? req.file.location : "";
    const user = new User({
      username,
      email,
      profile,
    });

    await User.register(user, password);

    res.json({ result: "ok" });
  } catch (error) {
    next(error);
  }
};
