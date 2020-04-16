import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import api from "./api";
import socketCreator from "./socket";
import { errorHandler, CustomError } from "./lib/error";

const app = express();
const server = http.Server(app);

import "./db";
import "./passport";
import "./utils";

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => res.send("Welcome Where is kim Server"));
app.use("/api", api);

socketCreator(server);

app.use(function (req, res, next) {
  next(new CustomError(404, "Not Found"));
});

app.use(function (err, req, res, next) {
  errorHandler(err, res);
});

module.exports = server;
