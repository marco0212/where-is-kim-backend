import express from "express";
import Team from "../model/team";
import User from "../model/user";
import { sendMail } from "../utils";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/new", async (req, res) => {
  try {
    const { teamName, createdBy, location, workOnTime, workOffTime } = req.body;
    const name = teamName.split(" ").join("-");
    const user = await User.findById(createdBy);
    const newTeam = await Team.create({
      name,
      display_name: teamName,
      created_by: user.id,
      location,
      work_on_time: workOnTime,
      work_off_time: workOffTime,
      admins: [user.id],
      participants: [user.id],
    });

    user.teams.push(newTeam.id);
    await user.save();
    res.json({ result: newTeam });
  } catch (err) {
    res.status(500);
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
    console.log(err);
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

export default router;
