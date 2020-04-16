import express from "express";
import auth from "./auth";
import team from "./team";
import thread from "./thread";

const router = express.Router();

router.use("/auth", auth);
router.use("/team", team);
router.use("/thread", thread);

export default router;
