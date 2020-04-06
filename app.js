import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "./model/user";

const app = express();

import "./db";
import "./passport";

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json(req.user);
});

app.post("/api/auth/login", (req, res) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) {
      res.status(400);
      return res.json({ result: "error", err });
    }

    if (!user) {
      res.status(400);
      return res.json({ result: "wrong account" });
    }

    req.login(user, { session: false }, (err) => {
      if (err) return res.json(err);

      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      return res.json({ result: { token, user } });
    });
  })(req, res);
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({
      username,
      email,
    });

    await User.register(user, password);

    res.json({ result: "ok" });
  } catch (error) {
    return res.json({ result: "error", error });
  }
});

module.exports = app;
