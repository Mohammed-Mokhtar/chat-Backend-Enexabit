import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

export const databaseConnection = () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  mongoose
    .connect(mongoUri, {
      family: 4,
    })
    .then((res) => {
      console.log("database connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
