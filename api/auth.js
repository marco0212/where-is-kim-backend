import jwt from "jsonwebtoken";
import User from "../model/user";
import express from "express";
import passport from "passport";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const router = express.Router();

const s3 = new aws.S3();
const bucket = "wik";
const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `user/${file.originalname}`);
    },
  }),
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

router.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, async (err, user) => {
    if (err) {
      res.status(400);
      return res.json({ result: "error", err });
    }

    if (!user) {
      res.status(403);
      return res.json({ result: "wrong account" });
    }

    user = await User.findById(user.id).populate("teams");

    req.login(user, { session: false }, (err) => {
      if (err) return res.json(err);

      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      return res.json({ result: { token, user } });
    });
  })(req, res);
});

router.post("/signup", upload.single("profile"), async (req, res) => {
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
    res.status(400);
    return res.json({ result: "error", error });
  }
});

export default router;
