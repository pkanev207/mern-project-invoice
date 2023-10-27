import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";

// $-title   Get All Users
// $-path    GET /api/v1/user/all
// $-auth    Private/Admin

const getAllUserAccounts = asyncHandler(async (req, res) => {
  // const pageSize = 20;
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.countDocuments({});

  const users = await User.find({})
    .sort({ createdAt: -1 }) // sort in descending order
    .select("-refreshToken")
    .limit(pageSize) // limit the query to the pageSize value
    // we get starting index of every page and always remember that indexes are zero based
    .skip(pageSize * (page - 1))
    .lean();  

  res.json({
    success: true,
    count,
    numberOfPages: Math.ceil(count / pageSize),
    users,
  });
});

export default getAllUserAccounts;
