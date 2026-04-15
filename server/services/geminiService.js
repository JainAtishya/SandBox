const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",  // Latest available model
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
    
    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    
    // Try to extract from ```json ... ``` blocks
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonText = jsonBlockMatch[1];
    } else {
      // Try to extract from ``` ... ``` blocks
      const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Try to find JSON object directly
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }
    }
    
    // Clean up common issues
    jsonText = jsonText.trim();
    
    const parsed = JSON.parse(jsonText);
    saveDebugLog(prompt, text, parsed);
    return parsed;
  } catch (error) {
    saveDebugLog(prompt, text, null, error);
    console.error("Gemini API Error:", error.message);
    throw new Error(`Failed to generate JSON: ${error.message}`);
  }
}

module.exports = { generateJSON };
