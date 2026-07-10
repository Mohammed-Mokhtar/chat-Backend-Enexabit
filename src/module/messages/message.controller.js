import { Router } from "express";
import { auth } from "../../common/middleware/auth.js";
import { Message } from "../../database/models/messages.model.js";

const router = Router();

router.post("/", auth, async (req, res) => {
  const { content, receiverId, roomId } = req.body;
  const senderId = req.user._id;
  const newMessage = await Message.create({
    content,
    receiverId,
    senderId,
    roomId,
  });
  res.status(201).json({ message: "success", newMessage });
});

router.get("/:roomId", auth, async (req, res) => {
  const { roomId } = req.params;

  const messages = await Message.find({
    roomId,
  }).sort({ createdAt: 1 });

  res.status(200).json({ message: "success", messages });
});

export default router;
