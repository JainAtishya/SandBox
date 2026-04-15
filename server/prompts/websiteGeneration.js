function getCompleteWebsitePrompt(businessName, description, tone, audience) {
  return `You are an expert brand strategist, product designer, and copywriter.
Your task: Analyze the following business and generate its Brand DNA, Design System, and Website Content in a single step.

**Business Information:**
- Business Name: ${businessName}
- Description: ${description}
${tone ? `- User-Specified Tone: ${tone}` : ''}
${audience ? `- User-Specified Audience: ${audience}` : ''}

Please follow these detailed instructions for each section and return a SINGLE JSON object containing all the information.

### 1. BRAND DNA
Deeply analyze the business to determine:
- tone (array of 2-3 strings from: professional, friendly, bold, elegant, playful, authoritative, warm, innovative, traditional, sophisticated, casual, energetic, calm)
- emotion (array of 2-3 strings from: trustworthy, exciting, calm, inspiring, luxurious, accessible, energetic, sophisticated, reliable, creative, comforting, empowering)
- audience (object with: primary (one sentence), demographics (age, location, income), psychographics (values, lifestyle), painPoints (array of 2-3 strings))
- industry (string, be specific)
- visualStyle (array of 2-3 strings from: modern, minimalist, vibrant, elegant, rustic, tech-forward, classic, bold, organic, industrial, luxurious, approachable)
- brandPersonality (array of 3 distinct adjectives)
- keyMessages (array of 2-3 core value propositions)

### 2. DESIGN TOKENS
Create a DISTINCTIVE color palette that reflects the brand tone!
Primary Color by Tone examples: 
- professional/trustworthy -> deep blue (#1E40AF)
- warm/friendly -> warm orange (#EA580C)
- bold/energetic -> vibrant red/purple (#DC2626)
- elegant/luxurious -> deep purple/gold (#581C87)
- calm/peaceful -> soft teal/green (#0D9488)
- playful -> bright pink/yellow (#DB2777)
- innovative/tech-forward -> electric blue/cyan (#0EA5E9)

Typography rules:
- modern/tech -> Inter, Space Grotesk
- elegant/luxury -> Playfair Display (heading), Lato (body)
- warm/friendly -> Nunito, Poppins
- bold/energetic -> Montserrat, Raleway

Border radius:
- modern/minimal -> small (0.25rem, 0.5rem, 0.75rem)
- friendly/warm/playful -> rounded (0.75rem, 1rem, 1.5rem)

Include HEX colors for:
- colors: primary, secondary, accent, neutral (50 to 900)
- typography: fontFamily (heading, body)
- spacing: scale (e.g. 1.25), section (e.g. "6rem"), component (e.g. "3rem"), element (e.g. "1rem")
- borderRadius: small, medium, large
- layout: style (e.g. "centered", "minimal"), maxWidth (e.g. "1280px")

Also, provide designReasoning (object with color, typography, layout properties explaining your choices).

### 3. WEBSITE CONTENT
Write conversion-focused copy matching the brand's tone and addressing audience pain points.
Include:
- hero: headline (6-10 words), subheadline (15-25 words), cta { text, link: "#contact" }
- features: title, items array (4 items, each with icon, title, description). Valid icons: shield, star, clock, heart, users, leaf, zap, award, target, sparkles, check, trending.
- testimonials: title, testimonials array (3 items, each with quote, author, role)
- cta: headline, supportingText, cta { text, link: "#contact" }

### OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanations) exactly like this structure:
{
  "brandDNA": {
    "tone": [],
    "emotion": [],
    "audience": {
      "primary": "",
      "demographics": "",
      "psychographics": "",
      "painPoints": []
    },
    "industry": "",
    "visualStyle": [],
    "brandPersonality": [],
    "keyMessages": []
  },
  "designTokens": {
    "colors": {
      "primary": "",
      "secondary": "",
      "accent": "",
      "neutral": { "50": "", "100": "", "200": "", "300": "", "400": "", "500": "", "600": "", "700": "", "800": "", "900": "" }
    },
    "typography": { "fontFamily": { "heading": "", "body": "" } },
    "spacing": { "scale": 1.25, "section": "", "component": "", "element": "" },
    "borderRadius": { "small": "", "medium": "", "large": "" },
    "layout": { "style": "", "maxWidth": "" }
  },
  "designReasoning": { "color": "", "typography": "", "layout": "" },
  "content": {
    "hero": { "headline": "", "subheadline": "", "cta": { "text": "", "link": "" } },
    "features": { "title": "", "items": [ { "icon": "", "title": "", "description": "" } ] },
    "testimonials": { "title": "", "testimonials": [ { "quote": "", "author": "", "role": "" } ] },
    "cta": { "headline": "", "supportingText": "", "cta": { "text": "", "link": "" } }
  }
}`;
}

module.exports = { getCompleteWebsitePrompt };
