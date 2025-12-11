// TTS 路由

const express = require('express');
const router = express.Router();
const { generateTTS, generateTTSSegments } = require('../controllers/ttsController');

// POST /tts - 生成单段语音
router.post('/', generateTTS);

// POST /tts/segments - 生成多段语音（分段朗读）
router.post('/segments', generateTTSSegments);

module.exports = router;

