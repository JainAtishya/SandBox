const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 3);
const RETRY_BASE_DELAY_MS = Number(process.env.GEMINI_RETRY_BASE_DELAY_MS || 800);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("service unavailable") ||
    message.includes("high demand") ||
    message.includes("resource_exhausted") ||
    message.includes("deadline exceeded") ||
    message.includes("timeout")
  );
}

function extractJsonText(text) {
  let jsonText = text;

  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    jsonText = jsonBlockMatch[1];
  } else {
    const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }
  }

  return jsonText.trim();
}

async function generateWithModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Debug logging setup
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';
const LOGS_DIR = path.join(__dirname, '../logs');

if (DEBUG_MODE && !fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function saveDebugLog(prompt, rawText, parsedJson, error = null) {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOGS_DIR, `gemini-call-${timestamp}.json`);
  
  const logData = {
    timestamp: new Date().toISOString(),
    prompt,
    rawResponse: rawText,
    parsedResult: parsedJson,
    error: error ? error.message : null
  };
  
  fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
  console.log(`[DEBUG] Gemini input/output saved to: ${logFile}`);
}

async function generateJSON(prompt) {
  let text = '';
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      throw new Error("GEMINI_API_KEY is missing or placeholder value is set in server/.env");
    }

    const modelsToTry = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL)];
    let lastError;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt++) {
        try {
          console.log(`🤖 Gemini model in use: ${modelName} (attempt ${attempt}/${GEMINI_MAX_RETRIES})`);
          text = await generateWithModel(modelName, prompt);
          const jsonText = extractJsonText(text);
          const parsed = JSON.parse(jsonText);
          saveDebugLog(prompt, text, parsed);
          return parsed;
        } catch (error) {
          lastError = error;
          const retryable = isRetryableError(error);
          const hasNextAttempt = attempt < GEMINI_MAX_RETRIES;

          if (retryable && hasNextAttempt) {
            const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.warn(`⚠️ Retryable Gemini error on ${modelName}, retrying in ${delayMs}ms...`);
            await sleep(delayMs);
            continue;
          }

          break;
        }
      }
    }

    throw lastError || new Error("Gemini request failed with unknown error");
  } catch (error) {
    saveDebugLog(prompt, text, null, error);
    console.error("Gemini API Error:", error.message);
    throw new Error(`Failed to generate JSON: ${error.message}`);
  }
}

module.exports = { generateJSON };
