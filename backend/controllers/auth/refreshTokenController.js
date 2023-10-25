import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";

// $-title   Get new access tokens from the refresh token
// $-path    GET /api/v1/auth/new_access_token
// $-auth    Public

// we are rotating the refresh tokens, deleting the old ones, creating new ones and detecting token reuse
const newAccessToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }

  const refreshToken = cookies.jwt;

  const options = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "None",
  };
  // clearing the old refresh token cookie, since we are going to make a new one
  res.clearCookie("jwt", options);

  const existingUser = await User.findOne({ refreshToken }).exec();
  // If no user exists with that refresh token and the refresh token has been used,
  // that means a refresh token reuse is detected, this can mean a user has been hacked!
  if (!existingUser) {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      async (err, decoded) => {
        if (err) {
          return res.sendStatus(403); // forbidden
        }

        const hackedUser = await User.findOne({ _id: decoded.id }).exec();
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );

    return res.sendStatus(403);
  }
  // filter old refresh token and create a new refresh token array without it
  const newRefreshTokenArray = existingUser.refreshToken.filter(
    (refT) => refT !== refreshToken
  );
  // if verified, create a new access and refresh token
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET_KEY,
    async (err, decoded) => {
      // we have received a token, but it has expired, so we are going to update our token in the db
      if (err) {
        existingUser.refreshToken = [...newRefreshTokenArray];
        await existingUser.save();
      }
      if (err || existingUser._id.toString() !== decoded.id) {
        return res.sendStatus(403);
      }
      //if we are at this point , this means the refresh token is still valid
      const accessToken = jwt.sign(
        {
          id: existingUser._id,
          roles: existingUser.roles,
        },
        process.env.JWT_ACCESS_SECRET_KEY,
        {
          expiresIn: "1h",
          // expiresIn: "10m"
        }
      );

      const newRefreshToken = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: "1d" }
      );
      // save the refresh token to the current user
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
    }
  );
});

export default newAccessToken;
