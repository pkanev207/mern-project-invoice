import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import { systemLogs } from "../../utils/Logger.js";

// $-title   Login User, get access and refresh tokens
// $-path    POST /api/v1/auth/login
// $-auth    Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400); // bad request
    throw new Error("Please provide a valid email and password");
  }

  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser || !(await existingUser.comparePassword(password))) {
    res.status(401); // unauthorized
    systemLogs.error("Incorrect email or password");
    throw new Error("Incorrect email or password");
  }

  if (!existingUser.isEmailVerified) {
    res.status(400);
    throw new Error(
      "You are not verified. Check your email, a verification email link was sent when you registered"
    );
  }
  
  if (!existingUser.active) {
    res.status(400);
    throw new Error(
      "You have been deactivated by the admin and login is impossible. Contact us for enquiries"
    );
  }

  if (existingUser && (await existingUser.comparePassword(password))) {
    const accessToken = jwt.sign(
      { id: existingUser._id, roles: existingUser.roles },
      process.env.JWT_ACCESS_SECRET_KEY,
      {
        expiresIn: "1h",
        // expiresIn: "10m", // in production
      }
    );

    const newRefreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const cookies = req.cookies;

    let newRefreshTokenArray = !cookies?.jwt
      ? existingUser.refreshToken
      : existingUser.refreshToken.filter((refT) => refT !== cookies.jwt);

    // if we have old cookie - we want to remove it:
    // 1. our user logs in but never uses the refresh token and does not log out,
    // 2. the refresh token is stolen,
    // 3. reuse detection is needed to clear out all refresh tokens when a user logs in,
    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const existingRefreshToken = await User.findOne({ refreshToken }).exec();
      // if we find user without that refresh token it means we have detected refresh token reuse
      if (!existingRefreshToken) {
        newRefreshTokenArray = [];
      }

      const options = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None",
      };

      res.clearCookie("jwt", options);
    }
    // if that's not the case, we now save the refresh token with the current user
    existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await existingUser.save();

    const options = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    };

    res.cookie("jwt", newRefreshToken, options);

    res.json({
      success: true,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      username: existingUser.username,
      provider: existingUser.provider,
      avatar: existingUser.avatar,
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials provided");
  }
});

export default loginUser;
