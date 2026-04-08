function getBrandDNAPrompt(businessName, description, tone, audience) {
  return `You are an expert brand strategist with 15 years of experience analyzing businesses and extracting their core brand identity.

Your task: Analyze the following business and extract its Brand DNA.

**Business Information:**
- Business Name: ${businessName}
- Description: ${description}
${tone ? `- User-Specified Tone: ${tone}` : ''}
${audience ? `- User-Specified Audience: ${audience}` : ''}

**Analysis Instructions:**

Deeply analyze this business to determine:

1. **TONE** (select 2-3 that best fit):
   Options: professional, friendly, bold, elegant, playful, authoritative, warm, innovative, traditional, sophisticated, casual, energetic, calm
   
2. **EMOTION** (select 2-3 emotional qualities):
   Options: trustworthy, exciting, calm, inspiring, luxurious, accessible, energetic, sophisticated, reliable, creative, comforting, empowering
   
3. **TARGET AUDIENCE**:
   - Primary: One-sentence description of main customer
   - Demographics: Age range, location type, income level
   - Psychographics: Values, lifestyle, preferences
   - Pain Points: 2-3 specific problems this business solves
   
4. **INDUSTRY**: Be specific (e.g., "boutique fitness studio", not just "fitness")

5. **VISUAL STYLE** (select 2-3):
   Options: modern, minimalist, vibrant, elegant, rustic, tech-forward, classic, bold, organic, industrial, luxurious, approachable
   
6. **BRAND PERSONALITY**: 3 distinct adjectives that capture the brand's character

7. **KEY MESSAGES**: 2-3 core value propositions (what makes them unique)

**Critical Rules:**
- If user provided tone/audience, prioritize those but expand on them
- Choose options that work together harmoniously
- Be specific and thoughtful, not generic
- Consider the industry context
- Think about what would differentiate this business from competitors

**Output Format:**
Return ONLY valid JSON (no markdown, no explanations):

{
  "tone": ["string", "string"],
  "emotion": ["string", "string"],
  "audience": {
    "primary": "string",
    "demographics": "string",
    "psychographics": "string",
    "painPoints": ["string", "string", "string"]
  },
  "industry": "string",
  "visualStyle": ["string", "string"],
  "brandPersonality": ["string", "string", "string"],
  "keyMessages": ["string", "string", "string"]
}`;
}

module.exports = { getBrandDNAPrompt };
