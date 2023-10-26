import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";

// $-title   Get User Profile
// $-path    GET /api/v1/user/profile
// $-auth    Private

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userProfile = await User.findById(userId, {
    // don't include this fields in the response
    refreshToken: 0,
    roles: 0,
    _id: 0,
  })
    // the lean option tells Mongoose to skip hydrating the result docs,
    // making the queries faster and less memory intensive
    // But the result docs are plain js objects and not Mongoose documents
    // so if executing a query and sending the results without modifications - should use lean()
    .lean();

  if (!userProfile) {
    res.status(204);
    throw new Error("User profile not found");
  }

  res.status(200).json({
    success: true,
    userProfile,
  });
});

export default getUserProfile;
