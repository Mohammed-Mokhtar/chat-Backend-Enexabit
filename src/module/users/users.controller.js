import { Router } from "express";
import { User } from "../../database/models/users.model.js";
import { auth } from "../../common/middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.json({ message: "success", users });
});

export default router;
