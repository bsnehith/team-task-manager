import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  checkEmailController,
  forgotPasswordController,
  loginController,
  signupController,
} from "./auth.controller.js";
import {
  checkEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), signupController);
router.post("/login", validate(loginSchema), loginController);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
router.get("/check-email", validate(checkEmailSchema), checkEmailController);

export default router;
