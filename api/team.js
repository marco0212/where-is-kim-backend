import express from "express";
import Team from "../model/team";
import User from "../model/user";
const router = express.Router();

router.post("/new", async (req, res) => {
  try {
    const {
      teamName,
      createdBy,
      teamLocation,
      workOnTime,
      workOffTime,
    } = req.body;
    const name = teamName.split(" ").join("-");
    const user = await User.findById(createdBy);
    const newTeam = await Team.create({
      name,
      display_name: teamName,
      created_by: user.id,
      location: teamLocation,
      work_on_time: workOnTime,
      work_off_time: workOffTime,
      admins: [user.id],
      participants: [user.id],
    });

    user.teams.push(newTeam.id);
    await user.save();
    res.json(newTeam);
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

export default router;
