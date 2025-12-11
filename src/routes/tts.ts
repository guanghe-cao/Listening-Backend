// TTS 路由
import { Router } from 'express';
import { generateTTS, generateTTSSegments } from '../controllers/ttsController';

const router = Router();

// POST /tts - 生成单段语音
router.post('/', generateTTS);

// POST /tts/segments - 生成多段语音（分段朗读）
router.post('/segments', generateTTSSegments);

export default router;

