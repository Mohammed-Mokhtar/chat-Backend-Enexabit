import express from "express";
import { Server } from "socket.io";
import authRouter from "./module/auth/auth.controller.js";
import { databaseConnection } from "./database/connection.js";
import userRouter from "./module/users/users.controller.js";
import messageRouter from "./module/messages/message.controller.js";
import cors from "cors";

export const bootstrap = async () => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    }),
  );

  await databaseConnection();

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  const server = app.listen(3000, () => {
    console.log("server is running on port 3000");
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("client connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`socket joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`socket left room: ${roomId}`);
    });

    socket.on("sendMessage", ({ roomId, message, senderId }) => {
      io.to(roomId).emit("receiveMessage", {
        roomId,
        message,
        senderId,
      });
    });

    socket.on("typingIndicator", ({ roomId }) => {
      socket.to(roomId).emit("isTyping");
    });

    socket.on("notTyping", ({ roomId }) => {
      socket.to(roomId).emit("isNotTyping");
    });
  });
};
