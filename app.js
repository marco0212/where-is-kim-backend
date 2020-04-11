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

const roomById = {};
const roomByName = {};
const socketById = {};
const userIdById = {};

io.on("connection", (socket) => {
  const id = socket.id;

  socket.on("join team", (userId, teamName) => {
    let room = roomByName[teamName];

    if (room) {
      room.push(id);
    } else {
      room = [id];
      roomByName[teamName] = room;
    }

    socketById[id] = socket;
    userIdById[id] = userId;
    roomById[id] = teamName;

    socket.join(teamName);
    const participants = room.map((id) => userIdById[id]);

    io.in(teamName).emit("join team", participants);
  });
});

module.exports = server;
