"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TTS 路由
const express_1 = require("express");
const ttsController_1 = require("../controllers/ttsController");
const router = (0, express_1.Router)();
// POST /tts - 生成单段语音
router.post('/', ttsController_1.generateTTS);
// POST /tts/segments - 生成多段语音（分段朗读）
router.post('/segments', ttsController_1.generateTTSSegments);
exports.default = router;
//# sourceMappingURL=tts.js.map