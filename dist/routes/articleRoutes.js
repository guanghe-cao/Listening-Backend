"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Article routes
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All article routes require userId header
router.use(auth_1.requireUserId);
router.get('/', articleController_1.getArticles);
router.get('/:id', articleController_1.getArticleById);
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map