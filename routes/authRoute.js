import express from "express";

const router = express.Router();

import {
  signup,
  login,
  logout,
  verifymail,
  passforgot,
} from "../controllers/auhtControllers.js";
import { verify } from "crypto";

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verift-mail", verifymail);

router.post("/forgot-password", passforgot);

export default router;
