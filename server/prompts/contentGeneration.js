function getHeroContentPrompt(businessName, brandDNA) {
  return `You are an expert copywriter creating hero section content.

**Business:** ${businessName}
**Brand DNA:** ${JSON.stringify(brandDNA, null, 2)}

Create a hero section that:
- Matches tone: ${brandDNA.tone?.join(", ")}
- Evokes emotion: ${brandDNA.emotion?.join(", ")}
- Speaks to: ${brandDNA.audience?.primary}
- Addresses pain point: ${brandDNA.audience?.painPoints?.[0]}

**Requirements:**
1. Headline: 6-10 words, value-focused, emotionally resonant
2. Subheadline: 15-25 words, clarifies what they do and why it matters
3. CTA Text: 2-3 words, action-oriented

Return ONLY valid JSON:

{
  "headline": "string",
  "subheadline": "string",
  "cta": {
    "text": "string",
    "link": "#contact"
  }
}`;
}

function getFeaturesContentPrompt(businessName, brandDNA) {
  return `You are an expert copywriter creating a features section.

**Business:** ${businessName}
**Brand DNA:** ${JSON.stringify(brandDNA, null, 2)}

Create 4 features that showcase what makes ${businessName} unique.

**Each feature should:**
- Address one of these pain points: ${brandDNA.audience?.painPoints?.join(", ")}
- Highlight one of these messages: ${brandDNA.keyMessages?.join(", ")}
- Icon: Single keyword for icon (shield, star, clock, heart, users, leaf, zap, award, target, sparkles, check, trending)
- Title: 3-5 words, benefit-focused
- Description: 15-25 words, specific and tangible

Return ONLY valid JSON:

{
  "title": "Why Choose ${businessName}",
  "features": [
    {
      "icon": "string",
      "title": "string",
      "description": "string"
    }
  ]
}`;
}

function getTestimonialsContentPrompt(businessName, brandDNA) {
  return `You are creating authentic-sounding testimonials.

**Business:** ${businessName}
**Brand DNA:** ${JSON.stringify(brandDNA, null, 2)}

Create 3 testimonials from the perspective of: ${brandDNA.audience?.primary}

**Each testimonial:**
- Quote: 20-35 words, mentions specific benefit, feels genuine (not overly promotional)
- Author: Realistic first name + last initial
- Role: Matches target audience demographic

Return ONLY valid JSON:

{
  "title": "What Our Customers Say",
  "testimonials": [
    {
      "quote": "string",
      "author": "string",
      "role": "string"
    }
  ]
}`;
}

function getCTAContentPrompt(businessName, brandDNA) {
  return `You are creating a conversion-focused CTA section.

**Business:** ${businessName}
**Brand DNA:** ${JSON.stringify(brandDNA, null, 2)}

Create a final CTA that drives action.

**Requirements:**
1. Headline: 6-10 words, creates urgency or highlights final benefit
2. Supporting Text: 15-20 words, overcomes final objection
3. Button Text: 2-3 words, clear action

Return ONLY valid JSON:

{
  "headline": "string",
  "supportingText": "string",
  "cta": {
    "text": "string",
    "link": "#contact"
  }
}`;
}

module.exports = {
  getHeroContentPrompt,
  getFeaturesContentPrompt,
  getTestimonialsContentPrompt,
  getCTAContentPrompt
};
