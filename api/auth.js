import jwt from "jsonwebtoken";
import User from "../model/user";
import express from "express";
import passport from "passport";

const router = express.Router();

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

router.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) {
      res.status(400);
      return res.json({ result: "error", err });
    }

    if (!user) {
      res.status(403);
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

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({
      username,
      email,
    });

    await User.register(user, password);

    res.json({ result: "ok" });
  } catch (error) {
    res.status(400);
    return res.json({ result: "error", error });
  }
});

export default router;
