import express from "express";
import Team from "../model/team";
import User from "../model/user";
import Record from "../model/record";
import Thread from "../model/thread";
const router = express.Router();

router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const tread = await Thread.findById(id);
    const userIdIndex = tread.likes.indexOf(userId);

    if (userIdIndex === -1) {
      tread.likes.push(userId);
    } else {
      tread.likes.splice(userIdIndex, 1);
    }

    await tread.save();
    res.json({ result: "ok" });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

router.post("/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;
    const tread = await Thread.findById(id);
    const comment = { author, text };

    tread.comments.push(comment);
    await tread.save();
    res.json({ result: "ok" });
  } catch (err) {
    res.status(500);
    res.json({ result: "error", err });
  }
});

export default router;
