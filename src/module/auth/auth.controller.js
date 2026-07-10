import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../database/models/users.model.js";

const router = Router();
const refreshTokenCookieName = "refreshToken";

const getAuthConfig = () => {
  const {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES_IN = "15m",
    REFRESH_TOKEN_EXPIRES_IN = "7d",
  } = process.env;

  if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables");
  }

  return {
    accessSecret: JWT_ACCESS_SECRET,
    refreshSecret: JWT_REFRESH_SECRET,
    accessExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
  };
};

const createTokens = (userId) => {
  const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn } =
    getAuthConfig();

  return {
    accessToken: jwt.sign({ id: userId }, accessSecret, {
      expiresIn: accessExpiresIn,
    }),
    refreshToken: jwt.sign({ id: userId }, refreshSecret, {
      expiresIn: refreshExpiresIn,
    }),
  };
};

const getRefreshCookieOptions = () => ({
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const getClearRefreshCookieOptions = () => {
  const { maxAge, ...options } = getRefreshCookieOptions();
  return options;
};

const getCookie = (req, name) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(name.length + 1));
};

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const existedEmail = await User.findOne({ email });
  if (existedEmail) return res.json({ message: "user already exist" });
  const userAdded = await User.create({ name, email, password });
  res.status(201).json({ message: "user added", userAdded });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const existedUser = await User.findOne({ email, password });
  if (!existedUser)
    return res.status(401).json({ message: "email or password are incorrect" });

  const { accessToken, refreshToken } = createTokens(existedUser._id);

  res
    .cookie(refreshTokenCookieName, refreshToken, getRefreshCookieOptions())
    .status(200)
    .json({ message: "login success", accessToken, userId: existedUser._id });
});

router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = getCookie(req, refreshTokenCookieName);

    if (!refreshToken) {
      return res.status(401).json({ message: "refresh token is required" });
    }

    const { refreshSecret } = getAuthConfig();
    const payload = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(404).json({ message: "this user is not exist" });
    }

    const tokens = createTokens(user._id);

    res
      .cookie(refreshTokenCookieName, tokens.refreshToken, getRefreshCookieOptions())
      .status(200)
      .json({
        message: "token refreshed",
        accessToken: tokens.accessToken,
        userId: user._id,
      });
  } catch (err) {
    res.status(401).json({ message: "invalid refresh token", error: err.message });
  }
});

router.post("/logout", (req, res) => {
  res
    .clearCookie(refreshTokenCookieName, getClearRefreshCookieOptions())
    .status(200)
    .json({ message: "logout success" });
});

export default router;
