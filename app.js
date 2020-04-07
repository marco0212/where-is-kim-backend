import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import auth from "./api/auth";
import team from "./api/team";
import { sendMail } from "./utils";

const app = express();

import "./db";
import "./passport";

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", auth);
app.use("/api/team", team);

// Sample API sending Mail to test

app.post("/mail", async (req, res) => {
  try {
    const result = await sendMail();

    res.json({ result });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

module.exports = app;
