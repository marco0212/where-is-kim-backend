import express from "express";
import http from "http";
import socketIO from "socket.io";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import auth from "./api/auth";
import team from "./api/team";
import thread from "./api/thread";

const app = express();
const server = http.Server(app);
const io = socketIO(server);

import "./db";
import "./passport";
import "./utils";

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", auth);
app.use("/api/team", team);
app.use("/api/thread", thread);

const roomByName = {};
const roomBySocketId = {};

io.on("connection", (socket) => {
  const socketId = socket.id;

  socket.on("join team", (teamName, userId) => {
    roomBySocketId[socketId] = teamName;

    if (roomByName[teamName]) {
      roomByName[teamName].push(userId);
    } else {
      roomByName[teamName] = [userId];
    }

    socket.join(teamName);
    socket.to(teamName).broadcast.emit("join team", roomByName[teamName]);
  });
});

module.exports = server;
