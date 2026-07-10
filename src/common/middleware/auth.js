import jwt from "jsonwebtoken";
import { User } from "../../database/models/users.model.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = bearerToken || req.headers.token;

    if (!token) return res.status(401).json({ message: "token is required" });
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.id);
    if (!user)
      return res.status(404).json({ message: "this user is not exist" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid token", error: err.message });
  }
};
