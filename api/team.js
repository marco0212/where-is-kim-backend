import express from "express";
import Team from "../model/team";
import User from "../model/user";
import Record from "../model/record";
import Thread from "../model/thread";
import { sendMail } from "../utils";
import jwt from "jsonwebtoken";
import moment from "moment";
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
      cb(null, `team/${file.originalname}`);
    },
  }),
});

router.post("/new", upload.single("file"), async (req, res) => {
  try {
    const {
      teamName,
      createdBy,
      latitude,
      longitude,
      workOnTime,
      workOffTime,
    } = req.body;
    const name = teamName.split(" ").join("-");
    const user = await User.findById(createdBy);
    const thumbnail = req.file ? req.file.location : "";

    const newTeam = await Team.create({
      name,
      display_name: teamName,
      created_by: user.id,
      location: { latitude, longitude },
      work_on_time: workOnTime,
      work_off_time: workOffTime,
      admins: [user.id],
      participants: [user.id],
      thumbnail,
    });

    user.teams.push(newTeam.id);
    await user.save();
    res.json({ result: newTeam });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:name/join", async (req, res) => {
  try {
    const name = req.params.name;
    const { userId } = req.body;
    const team = await Team.findOne({ name })
      .populate("participants")
      .populate("records")
      .populate({
        path: "threads",
        populate: { path: "created_by" },
      });

    if (team.admins.filter((admin) => admin.id === userId).length) {
      return res.json({ result: "ok", level: "admin", team });
    } else if (
      team.participants.filter((participant) => participant.id === userId)
        .length
    ) {
      delete team.records;
      return res.json({ result: "ok", level: "normal", team });
    }

    return res.json({ result: "wrong user id" });
  } catch (err) {
    res.json({ result: "error", err });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const teamId = req.params.id;
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    const teamUserIds = deletedTeam.participants;

    for (let i = 0; i < teamUserIds.length; i++) {
      const user = await User.findById(teamUserIds[i]);
      const targetTeamIndex = user.teams.indexOf(teamId);

      user.teams.splice(targetTeamIndex, 1);
      await user.save();
    }

    res.json({ result: deletedTeam });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:teamId/invite", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { memberEmail } = req.body;
    const team = await Team.findById(teamId);
    const payload = { teamId, email: memberEmail };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const result = await sendMail(memberEmail, team.display_name, token);

    res.json({ result });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const { teamId, email } = jwt.decode(token);
    const team = await Team.findById(teamId);
    const user = await User.findOne({ email });

    user.teams.push(teamId);
    team.participants.push(user.id);

    await user.save();
    await team.save();

    res.json({ result: "ok" });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:teamId/onWork", async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(teamId);
    const user = await User.findById(userId);
    const notDoneRecord = await Record.findOne({
      team: teamId,
      recorded_by: userId,
      work_off: { $exists: false },
    });

    if (notDoneRecord) {
      throw Error("Can't record new One");
    }

    const workOnTime = `${moment().format("YYYY-MM-DD")}T${team.work_on_time}`;
    const isLate = moment().isAfter(workOnTime);
    const diff = moment().diff(moment(workOnTime), "minute");
    const message = `${user.username}이(가) ${
      isLate ? `${diff}분 초과해서 ` : ""
    }출근했습니다.`;
    const record = await Record.create({
      team: teamId,
      recorded_by: userId,
      is_late: isLate,
    });
    const thread = await Thread.create({
      text: message,
      created_by: userId,
    });

    team.records.push(record.id);
    team.threads.push(thread.id);
    await team.save();
    res.json({ result: "ok" });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:teamId/offWork", async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(teamId);
    const user = await User.findById(userId);
    const record = await Record.findOneAndUpdate(
      { recorded_by: userId, team: teamId, work_off: { $exists: false } },
      { work_off: moment() },
      { returnNewDocument: true }
    );

    if (!record) {
      throw Error("There is no record on worked");
    }

    const workOffTime = `${moment().format("YYYY-MM-DD")}T${
      team.work_off_time
    }`;
    const isOver = moment().isAfter(workOffTime);
    const diff = Math.abs(moment().diff(moment(workOffTime), "minute"));
    const message = `${user.username}이(가) ${diff}분 ${
      isOver ? "초과해서" : "일찍"
    } 퇴근했습니다.`;
    const thread = await Thread.create({
      created_by: userId,
      text: message,
    });

    team.threads.push(thread.id);
    await team.save();
    res.json({ result: "ok" });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:teamId/records", async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  const team = await Team.findById(teamId).populate("records");
  const isAdmin = team.admins.filter((id) => id === userId).length;

  if (!isAdmin) {
    //throw Error("Unauthenticate");
  }

  res.json({ result: "ok", records: team.records });
});

router.put("/:teamId/admins", async (req, res) => {
  try {
    const { teamId } = req.params;
    const { admins } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { admins },
      { new: true }
    ).populate("participants");

    res.json({ result: team });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});
export default router;
