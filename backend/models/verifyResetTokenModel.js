import mongoose from "mongoose";

const { Schema } = mongoose;

const verifyResetTokenSchema = new Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    // expires in 15 minutes - powerful Mongo feature
    // the document will auto delete itself
    expires: 900,
  },
});

const VerifyResetToken = mongoose.model(
  "VerifyResetToken",
  verifyResetTokenSchema
);

export default VerifyResetToken;
