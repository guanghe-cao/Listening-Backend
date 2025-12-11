"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
console.log("🔧 Auth routes: Registering POST /login");
router.post("/login", (req, res, next) => {
    console.log("🚀 Login route handler called!");
    (0, authController_1.login)(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map