import express from "express";
import registerUser from "../controllers/auth/registerController.js";
import verifyUserEmail from "../controllers/auth/verifyEmailController.js";
import loginUser from "../controllers/auth/loginController.js";
// to limit login attempts
import { loginLimiter } from "../middleware/apiLimiter.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:emailToken/:userId", verifyUserEmail);
// router.post("/login", loginLimiter, loginUser);
router.post("/login", loginUser);

export default router;