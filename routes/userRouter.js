import express from "express";
import { editProfile, getUser, login, register, updatePassword, updateProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.get("/logout", logout);
// router.get("/logout", logout);
//first it will autheticate then i will logout


router.get("/:userId", getUser);
router.put("/update/profile", isAuthenticated, updateProfile)


router.post("/edit", editProfile);
//updating our password in /password route navigation
router.put("/update/profile/password", isAuthenticated, updatePassword)
export default router;
