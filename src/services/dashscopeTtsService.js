// DashScope TTS 服务模块
// 封装阿里云百炼 Qwen3 TTS 的调用逻辑

const fetch = require('node-fetch');

const DASHSCOPE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const DEFAULT_VOICE = 'Jennifer';
const DEFAULT_MODEL = 'qwen3-tts-flash';
// Language type configuration for mixed-language support:
// - The text parameter may contain mixed Chinese and English in the same sentence
// - We treat the entire text as a single UTF-8 string and do NOT split by language
// - Qwen3-TTS-Flash supports mixed-language content and can handle Chinese + English naturally
// - Using "Chinese" as the base language, but the model automatically handles English words/phrases
//   within the text (Qwen3-TTS-Flash has built-in multilingual support)
const DEFAULT_LANGUAGE_TYPE = 'Chinese';

// TTS 分段长度限制（避免 DashScope "Range of input length should be [0, 600]" 错误）
const MAX_SEGMENT_LENGTH = 400;      // 硬上限，每段长度必须 <= 此值
const SAFE_SEGMENT_LENGTH = 380;     // 安全长度，优先在此长度附近的标点处分割

/**
 * 调用 DashScope TTS API 生成单段语音
 * 
 * Note: The text parameter may contain mixed Chinese and English in the same sentence.
 * We treat the entire text as a single UTF-8 string and do NOT split by language.
 * The TTS model/voice is configured to handle mixed-language content naturally.
 * 
 * @param {string} text - 要朗读的文本（可能包含中英文混合内容）
 * @param {string} voice - 语音类型，默认 "Jennifer"（支持中英文混合朗读）
 * @returns {Promise<Buffer>} 音频文件的二进制数据
 * @throws {Error} 如果 API 调用失败或下载音频失败
 */
async function generateSingleTTS(text, voice = DEFAULT_VOICE) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not set');
  }

  // Ensure text is treated as UTF-8 string (may contain mixed Chinese + English)
  // We do NOT split by language - the entire text is sent as-is to DashScope
  const textToProcess = String(text);

  // 第一步：调用 DashScope TTS API 获取音频 URL
  // Note: language_type is set to "Chinese" but Qwen3-TTS-Flash model supports mixed-language content
  // The model can automatically handle English words/phrases within Chinese text
  // We do NOT split the text by language - the entire mixed text is sent as-is
  console.log('[DashScope] Calling TTS API...');
  console.log('[DashScope] Request config:', {
    model: DEFAULT_MODEL,
    voice: voice,
    language_type: DEFAULT_LANGUAGE_TYPE,
    textLength: textToProcess.length
  });
  
  const requestBody = {
    model: DEFAULT_MODEL,
    input: {
      text: textToProcess, // UTF-8 string, may contain mixed Chinese + English in the same sentence
      voice: voice, // Voice chosen to support mixed-language content (e.g., Jennifer)
      language_type: DEFAULT_LANGUAGE_TYPE // "Chinese" - but model supports mixed-language naturally
    }
  };
  
  const ttsResponse = await fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  // Log response status
  console.log('[DashScope] Response status:', ttsResponse.status, ttsResponse.statusText);

  // 检查 HTTP 状态码
  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    const errorSnippet = errorText.length > 300 ? errorText.substring(0, 300) + '...' : errorText;
    
    console.error('[DashScope] ✗ TTS API error - Status:', ttsResponse.status);
    console.error('[DashScope] Response body (first 300 chars):', errorSnippet);
    
    // Create a detailed error message
    let errorMessage = `DashScope TTS API returned status ${ttsResponse.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        errorMessage += `: ${errorJson.message}`;
      } else if (errorJson.error) {
        errorMessage += `: ${JSON.stringify(errorJson.error)}`;
      }
    } catch (e) {
      // If not JSON, use the text as-is (truncated)
      if (errorText) {
        errorMessage += `: ${errorSnippet}`;
      }
    }
    
    const providerError = new Error(errorMessage);
    providerError.statusCode = ttsResponse.status;
    providerError.providerResponse = errorText;
    throw providerError;
  }

  // 解析返回的 JSON
  const ttsData = await ttsResponse.json();
  
  // Log response body snippet
  const responseSnippet = JSON.stringify(ttsData).substring(0, 300);
  console.log('[DashScope] Response body (first 300 chars):', responseSnippet);

  // 检查返回数据结构
  if (!ttsData.output || !ttsData.output.audio || !ttsData.output.audio.url) {
    console.error('[DashScope] ✗ Invalid response structure');
    console.error('[DashScope] Full response:', JSON.stringify(ttsData, null, 2));
    throw new Error('DashScope TTS service error: invalid response structure - missing output.audio.url');
  }

  const audioUrl = ttsData.output.audio.url;
  console.log('[DashScope] ✓ Got audio URL, downloading...');

  // 第二步：下载音频文件
  console.log('[DashScope] Downloading audio from URL...');
  const audioResponse = await fetch(audioUrl);

  if (!audioResponse.ok) {
    console.error('[DashScope] ✗ Failed to download audio - Status:', audioResponse.status);
    console.error('[DashScope] Audio URL:', audioUrl);
    throw new Error(`DashScope TTS service error: Failed to download audio - HTTP ${audioResponse.status}`);
  }

  // 获取音频二进制数据
  const audioBuffer = await audioResponse.buffer();
  console.log('[DashScope] ✓ Downloaded audio, size:', audioBuffer.length, 'bytes');

  return audioBuffer;
}

/**
 * 将长文本智能分段
 * @param {string} text - 原始文本
 * @param {number} maxLength - 每段最大长度，默认使用 MAX_SEGMENT_LENGTH (400)
 * @param {number} safeLength - 安全长度（缓冲区），默认使用 SAFE_SEGMENT_LENGTH (380)
 * @returns {string[]} 分段后的文本数组，每段长度严格 <= maxLength
 */
function splitTextIntoChunks(text, maxLength = MAX_SEGMENT_LENGTH, safeLength = SAFE_SEGMENT_LENGTH) {
  if (!text || text.length === 0) {
    return [];
  }

  // 如果文本长度小于等于安全长度，直接返回
  if (text.length <= safeLength) {
    return [text];
  }

  // 标点符号：句号、问号、感叹号、分号、换行、逗号、英文标点
  const strongPunctuation = ['。', '！', '？', '!', '?', '；', ';', '\n'];
  const weakPunctuation = ['，', ',', '.'];

  const chunks = [];
  let currentChunk = '';
  let i = 0;

  // 按字符遍历文本
  while (i < text.length) {
    const char = text[i];
    currentChunk += char;
    i++;

    // 如果当前 chunk 长度达到或超过安全长度
    if (currentChunk.length >= safeLength) {
      // 尝试在标点处截断
      let foundBreak = false;
      let breakIndex = -1;
      
      // 搜索范围：从 safeLength 往前到 maxLength，优先在 safeLength 附近查找
      // 搜索起点：从 safeLength 往前找最多 50 个字符（但不超过当前 chunk 长度）
      const searchStart = Math.max(0, safeLength - 50);
      // 搜索终点：不超过 maxLength 和当前 chunk 长度
      const searchEnd = Math.min(currentChunk.length, maxLength);
      
      // 优先在 safeLength 附近查找强标点
      for (let j = searchEnd - 1; j >= searchStart; j--) {
        if (strongPunctuation.includes(currentChunk[j])) {
          breakIndex = j;
          foundBreak = true;
          break;
        }
      }

      // 如果没找到强标点，尝试弱标点
      if (!foundBreak) {
        for (let j = searchEnd - 1; j >= searchStart; j--) {
          if (weakPunctuation.includes(currentChunk[j])) {
            breakIndex = j;
            foundBreak = true;
            break;
          }
        }
      }

      // 如果找到了合适的截断点
      if (foundBreak && breakIndex >= 0) {
        // 在标点后截断（包含标点）
        const chunk = currentChunk.substring(0, breakIndex + 1).trim();
        if (chunk.length > 0) {
          // 确保 chunk 长度不超过 maxLength（理论上应该不会超过，但做双重检查）
          if (chunk.length <= maxLength) {
            chunks.push(chunk);
          } else {
            // 如果意外超过，截断到 maxLength
            chunks.push(chunk.substring(0, maxLength));
          }
          // 更新 currentChunk 为剩余部分
          currentChunk = currentChunk.substring(breakIndex + 1);
        }
      } else if (currentChunk.length >= maxLength) {
        // 如果还是没找到合适的截断点，且当前 chunk 已达到最大长度，硬切
        const chunk = currentChunk.substring(0, maxLength).trim();
        if (chunk.length > 0) {
          chunks.push(chunk);
          currentChunk = currentChunk.substring(maxLength);
        } else {
          // 如果截断后为空，说明遇到了超长无标点文本，强制截断
          chunks.push(currentChunk.substring(0, maxLength));
          currentChunk = currentChunk.substring(maxLength);
        }
      }
      // 如果还没达到最大长度，继续累积
    }
  }

  // 处理最后剩余的 chunk
  if (currentChunk.trim().length > 0) {
    const lastChunk = currentChunk.trim();
    // 确保最后一段也不超过 maxLength
    if (lastChunk.length <= maxLength) {
      chunks.push(lastChunk);
    } else {
      // 如果最后一段超过 maxLength，需要继续分割
      let remaining = lastChunk;
      while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
          chunks.push(remaining);
          break;
        } else {
          chunks.push(remaining.substring(0, maxLength));
          remaining = remaining.substring(maxLength);
        }
      }
    }
  }

  // 最终验证：确保所有段长度都严格 <= maxLength
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length > maxLength) {
      console.warn(`Warning: Segment ${i} length (${chunks[i].length}) exceeds maxLength (${maxLength}), truncating...`);
      chunks[i] = chunks[i].substring(0, maxLength);
    }
  }

  return chunks;
}

// 为了向后兼容，保留 generateSpeech 作为 generateSingleTTS 的别名
const generateSpeech = generateSingleTTS;

module.exports = {
  generateSingleTTS,
  generateSpeech, // 向后兼容
  splitTextIntoChunks,
  MAX_SEGMENT_LENGTH,
  SAFE_SEGMENT_LENGTH,
  DEFAULT_VOICE
};


