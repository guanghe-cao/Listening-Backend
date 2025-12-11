import { Router } from "express";
import { login } from "../controllers/authController";

const router = Router();

console.log("🔧 Auth routes: Registering POST /login");
router.post("/login", (req, res, next) => {
  console.log("🚀 Login route handler called!");
  login(req, res).catch(next);
});

export default router;
