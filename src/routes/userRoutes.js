import e from "express";
import { register } from "#controllers/usersController/register.js"
// import { registerWithOtp } from "../controllers/usersController/registerWithOtp.js";
import { verifyAccount } from "#controllers/usersController/verifyAccount.js";
import { login } from "#controllers/usersController/login.js";
import { logout } from "#controllers/usersController/logout.js";
// import { isAuthenticated } from "#middlewares/authMiddleware/auth.js";
import { getUser } from "#controllers/usersController/getUser.js";
import { forgotPassword } from "#controllers/usersController/forgotPassword.js";
import { resetPassword } from "#controllers/usersController/resetPassword.js";
import { isAuthCookies } from "#middlewares/authMiddleware/authCookies.js";
// import { refresh } from "../controllers/usersController/refresh.js";

const router = e.Router();

router.post("/register", register);
router.post("/verify-account", verifyAccount);
router.post("/login", login);
router.get("/logout", isAuthCookies, logout);
router.get("/me", isAuthCookies, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;