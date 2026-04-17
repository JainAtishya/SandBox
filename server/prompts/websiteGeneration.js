function getCompleteWebsitePrompt(businessName, description, tone, audience) {
    return `You are an expert brand strategist, product designer, and copywriter.
Your task: Analyze the following business and generate THREE distinct website variations.

**Business Information:**
- Business Name: ${businessName}
- Description: ${description}
${tone ? `- User-Specified Tone: ${tone}` : ''}
${audience ? `- User-Specified Audience: ${audience}` : ''}

Generate THREE entirely distinct variations:
1. "confident": A bold, professional, and energetic variation.
2. "approachable": A friendly, warm, and community-driven variation.
3. "premium": An elegant, sophisticated, and luxurious variation.

For EACH variation, provide its own Brand DNA, Design System, and Website Content. Ensure the color palettes, typography, layout choices, and copywriting are noticeably different to fit their specific archetype.

### EACH VARIATION MUST INCLUDE:

### 1. BRAND DNA
- tone (array of 2-3 strings fitting the variation)
- emotion (array of 2-3 strings)
- audience (object with: primary, demographics, psychographics, painPoints (array of 2-3 strings))
- industry (string)
- visualStyle (array of 2-3 strings fitting the variation)
- brandPersonality (array of 3 distinct adjectives)
- keyMessages (array of 2-3 core value propositions)

### 2. DESIGN TOKENS
Distinctive color palette reflecting the variation's vibe:
- colors: primary, secondary, accent, neutral (50 to 900)
- typography: fontFamily (heading, body)
- spacing: scale, section, component, element
- borderRadius: small, medium, large
- layout: style (e.g. "centered", "split", "minimal", "dynamic"), maxWidth (e.g. "1280px")

Also provide designReasoning (object with color, typography, layout properties explaining choices).

### 3. WEBSITE CONTENT
Write conversion-focused copy matching the variation's tone.
- hero: headline (6-10 words), subheadline (15-25 words), cta { text, link: "#contact" }
- features: title, items array (4 items, each with icon, title, description).
- testimonials: title, testimonials array (3 items, each with quote, author, role)
- cta: headline, supportingText, cta { text, link: "#contact" }

### OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanations) exactly like this structure:
{
  "variations": [
    {
      "id": "confident",
      "brandDNA": { ... },
      "designTokens": { ... },
      "designReasoning": { "color": "", "typography": "", "layout": "" },
      "content": {
        "hero": { ... },
        "features": { ... },
        "testimonials": { ... },
        "cta": { ... }
      }
    },
    {
      "id": "approachable",
      "brandDNA": { ... },
      "designTokens": { ... },
      "designReasoning": { ... },
      "content": { ... }
    },
    {
      "id": "premium",
      "brandDNA": { ... },
      "designTokens": { ... },
      "designReasoning": { ... },
      "content": { ... }
    }
  ]
}`;
}

module.exports = { getCompleteWebsitePrompt };
