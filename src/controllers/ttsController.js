// TTS 控制器

const { generateSingleTTS, splitTextIntoChunks, MAX_SEGMENT_LENGTH, SAFE_SEGMENT_LENGTH, DEFAULT_VOICE } = require('../services/dashscopeTtsService');

// 文本长度限制（字符数）
const MAX_TEXT_LENGTH = 10000;

/**
 * POST /tts/segments
 * 
 * Request Body Contract:
 * {
 *   text: string;        // Required. Mixed Chinese + English allowed in the same sentence
 *   voice?: string;      // Optional. Default: "Jennifer"
 * }
 * 
 * Response (Success - 200):
 * {
 *   segments: [
 *     {
 *       index: number,
 *       text: string,
 *       audioBase64: string
 *     }
 *   ],
 *   totalSegments: number
 * }
 * 
 * Response (Error):
 * - 400: { "error": "Missing text field" } - if text is missing or empty
 * - 500: { "error": "DASHSCOPE_API_KEY is not set" } - if API key missing
 * - 502: { "error": "TTS provider error: <message>" } - if DashScope returns error
 * - 500: { "error": "Internal server error" } - for unexpected errors
 * 
 * Example curl:
 * curl -X POST http://localhost:3000/tts/segments \
 *   -H "Content-Type: application/json" \
 *   -d '{"text":"这是一个TTS测试 test."}'
 * 
 * Debug mode (use sample text):
 * curl -X POST http://localhost:3000/tts/segments?debugSample=1 \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 */

/**
 * 生成多段语音（分段朗读）
 * 
 * Note: The text parameter may contain mixed Chinese and English in the same sentence.
 * We do NOT split the text by language. Each segment is sent as-is to the TTS provider,
 * which is configured to handle mixed-language content naturally.
 * 
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - Next function (not used, but kept for Express signature)
 */
async function generateTTSSegments(req, res, next) {
  // Log incoming request
  console.log('[TTS] ========================================');
  console.log('[TTS] Incoming request to /tts/segments');
  console.log('[TTS] Method:', req.method);
  console.log('[TTS] URL:', req.url);
  console.log('[TTS] Query params:', req.query);
  
  try {
    const { text, voice } = req.body;
    const debugSample = req.query.debugSample === '1' || req.query.debugSample === 'true';
    
    // Debug mode: use sample text if requested or if text is missing
    let textToProcess = text;
    if (debugSample || !textToProcess) {
      textToProcess = "这是一个TTS测试 test. This is a mixed-language test for TTS system.";
      console.log('[TTS] Using debug sample text (debugSample=' + debugSample + ', text missing=' + !text + ')');
    }
    
    // Log request body (without secrets)
    console.log('[TTS] Request body:', {
      textLength: textToProcess ? textToProcess.length : 0,
      voice: voice || DEFAULT_VOICE,
      hasText: !!textToProcess
    });
    
    // Validate text field
    if (!textToProcess) {
      console.error('[TTS] Error: Missing text field');
      return res.status(400).json({
        error: "Missing text field"
      });
    }
    
    // Validate text type
    if (typeof textToProcess !== 'string') {
      console.error('[TTS] Error: text must be a string, got:', typeof textToProcess);
      return res.status(400).json({
        error: "text must be a string"
      });
    }
    
    // Validate text is not empty
    if (textToProcess.trim().length === 0) {
      console.error('[TTS] Error: text is empty');
      return res.status(400).json({
        error: "Missing text field"
      });
    }
    
    // Check API Key
    if (!process.env.DASHSCOPE_API_KEY) {
      console.error('[TTS] Error: DASHSCOPE_API_KEY is not set');
      return res.status(500).json({
        error: "DASHSCOPE_API_KEY is not set"
      });
    }
    
    // Determine voice to use
    const ttsVoice = (voice && typeof voice === 'string') ? voice : DEFAULT_VOICE;
    console.log('[TTS] Using voice:', ttsVoice);
    
    // Split text into chunks
    console.log('[TTS] Splitting text into segments...');
    const segments = splitTextIntoChunks(textToProcess, MAX_SEGMENT_LENGTH, SAFE_SEGMENT_LENGTH);
    
    // Log segmentation info
    console.log(`[TTS] Original text length: ${textToProcess.length} characters`);
    console.log(`[TTS] Split into ${segments.length} segments`);
    if (segments.length > 0) {
      for (let i = 0; i < Math.min(segments.length, 5); i++) {
        console.log(`[TTS] Segment ${i}: ${segments[i].length} characters`);
      }
      if (segments.length > 5) {
        console.log(`[TTS] ... and ${segments.length - 5} more segments`);
      }
    }
    
    // Process segments serially
    const results = [];
    for (let i = 0; i < segments.length; i++) {
      const segmentText = segments[i];
      
      console.log(`[TTS] Processing segment ${i + 1}/${segments.length} (${segmentText.length} chars)...`);
      
      try {
        // Call DashScope TTS service
        console.log(`[TTS] Calling DashScope TTS with textLength = ${segmentText.length}`);
        const audioBuffer = await generateSingleTTS(segmentText, ttsVoice);
        
        // Convert to base64
        const audioBase64 = audioBuffer.toString('base64');
        
        results.push({
          index: i,
          text: segmentText,
          audioBase64: audioBase64
        });
        
        console.log(`[TTS] ✓ Generated segment ${i + 1}/${segments.length} (audio size: ${audioBuffer.length} bytes)`);
      } catch (segmentError) {
        // Segment generation failed
        console.error(`[TTS] ✗ Failed to generate segment ${i}:`, segmentError);
        console.error(`[TTS] Segment text (first 200 chars):`, segmentText.substring(0, 200));
        console.error(`[TTS] Error message:`, segmentError.message);
        console.error(`[TTS] Error stack:`, segmentError.stack);
        
        // Check if it's a provider error (has status code info)
        const errorMessage = segmentError.message || 'Unknown error';
        const isProviderError = errorMessage.includes('DashScope') || 
                               errorMessage.includes('status') ||
                               errorMessage.includes('provider');
        
        if (isProviderError) {
          return res.status(502).json({
            error: `TTS provider error: ${errorMessage}`
          });
        } else {
          return res.status(500).json({
            error: "Internal server error"
          });
        }
      }
    }
    
    // Success: return results
    console.log(`[TTS] ✓ Successfully generated all ${results.length} segments`);
    console.log('[TTS] ========================================');
    
    return res.json({
      segments: results,
      totalSegments: results.length
    });
    
  } catch (error) {
    // Unexpected error
    console.error('[TTS] ✗ Unexpected error in TTS segments controller:', error);
    console.error('[TTS] Error message:', error.message);
    console.error('[TTS] Error stack:', error.stack);
    console.log('[TTS] ========================================');
    
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

/**
 * 生成语音（单段）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - Next function
 */
async function generateTTS(req, res, next) {
  try {
    const { text, voice } = req.body;

    // 验证 text 是否存在
    if (!text) {
      return res.status(400).json({
        error: "text is required"
      });
    }

    // 验证 text 类型
    if (typeof text !== 'string') {
      return res.status(400).json({
        error: "text must be a string"
      });
    }

    // 验证文本长度
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: `Text length exceeds maximum limit of ${MAX_TEXT_LENGTH} characters`
      });
    }

    // 检查 API Key（启动时已检查，这里再次确认）
    if (!process.env.DASHSCOPE_API_KEY) {
      console.error("DASHSCOPE_API_KEY is not set");
      return res.status(500).json({
        error: "DASHSCOPE_API_KEY is not set"
      });
    }

    // 确定要使用的 voice：默认 Jennifer，可被 body.voice 覆盖
    const ttsVoice = (voice && typeof voice === 'string') ? voice : DEFAULT_VOICE;

    try {
      // 调用 DashScope TTS 服务
      const audioBuffer = await generateSingleTTS(text, ttsVoice);

      // 设置响应头
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length);

      // 返回音频数据
      res.send(audioBuffer);

    } catch (serviceError) {
      // 处理服务层错误
      console.error('DashScope TTS service error:', serviceError);

      // 如果是 API Key 未设置错误，返回 500
      if (serviceError.message.includes('DASHSCOPE_API_KEY is not set')) {
        return res.status(500).json({
          error: "DASHSCOPE_API_KEY is not set"
        });
      }

      // 其他错误返回 502
      return res.status(502).json({
        error: "Failed to generate speech"
      });
    }

  } catch (error) {
    console.error('Unexpected error in TTS controller:', error);
    return res.status(502).json({
      error: "Failed to generate speech"
    });
  }
}

module.exports = {
  generateTTS,
  generateTTSSegments
};
