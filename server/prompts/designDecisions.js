function getDesignDecisionsPrompt(brandDNA) {
  return `You are a senior product designer creating a UNIQUE design system based on brand identity.

**Brand DNA:**
${JSON.stringify(brandDNA, null, 2)}

**IMPORTANT: Create a DISTINCTIVE color palette that strongly reflects the brand tone!**

### COLOR RULES (be bold with these choices):

**Primary Color by Tone:**
- "professional" or "trustworthy" → Deep blue: #1E40AF or #1D4ED8
- "warm" or "friendly" → Warm orange: #EA580C or #C2410C  
- "bold" or "energetic" → Vibrant red/purple: #DC2626 or #7C3AED
- "elegant" or "luxurious" → Deep purple/gold: #581C87 or rich burgundy #7F1D1D
- "calm" or "peaceful" → Soft teal/green: #0D9488 or #059669
- "playful" → Bright pink/yellow: #DB2777 or #CA8A04
- "innovative" or "tech-forward" → Electric blue/cyan: #0EA5E9 or #06B6D4

**Secondary Color:** Pick a CONTRASTING complementary color
**Accent Color:** High-contrast for CTAs (yellow #F59E0B works well, or white on dark)

### TYPOGRAPHY RULES:

- "modern/tech" → Inter, Space Grotesk, or DM Sans
- "elegant/luxury" → Playfair Display (heading) + Lato (body)
- "warm/friendly" → Nunito or Poppins
- "bold/energetic" → Montserrat or Raleway
- "traditional" → Merriweather or Lora

### BORDER RADIUS:

- "modern/minimal" → Sharp: 0.25rem, 0.5rem, 0.75rem
- "friendly/warm" → Rounded: 0.75rem, 1rem, 1.5rem
- "playful" → Very round: 1rem, 1.5rem, 2rem
- "elegant/luxury" → Subtle: 0.125rem, 0.25rem, 0.5rem

### SPACING:

- "energetic" → Tight: scale 1.15, section 4rem
- "calm/elegant" → Spacious: scale 1.5, section 8rem
- Default → Medium: scale 1.25, section 6rem

Return ONLY valid JSON with HEX colors:

{
  "colors": {
    "primary": "#HEX",
    "secondary": "#HEX", 
    "accent": "#HEX",
    "neutral": {
      "50": "#FAFAFA",
      "100": "#F4F4F5",
      "200": "#E4E4E7",
      "300": "#D4D4D8",
      "400": "#A1A1AA",
      "500": "#71717A",
      "600": "#52525B",
      "700": "#3F3F46",
      "800": "#27272A",
      "900": "#18181B"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Font Name",
      "body": "Font Name"
    }
  },
  "spacing": {
    "scale": 1.25,
    "section": "6rem",
    "component": "3rem",
    "element": "1rem"
  },
  "borderRadius": {
    "small": "0.5rem",
    "medium": "0.75rem",
    "large": "1rem"
  }
}`;
}

module.exports = { getDesignDecisionsPrompt };
