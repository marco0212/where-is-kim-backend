import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import auth from "./api/auth";
import team from "./api/team";
import thread from "./api/thread";

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
app.use("/api/thread", thread);

module.exports = app;
