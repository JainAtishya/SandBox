const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { generateJSON } = require('../services/geminiService');
const { getCompleteWebsitePrompt } = require('../prompts/websiteGeneration');

const WEBSITE_CACHE_TTL_MS = Number(process.env.WEBSITE_CACHE_TTL_MS || 15 * 60 * 1000);
const websiteGenerationCache = new Map();

// Fallback values in case AI fails
const FALLBACK_BRAND_DNA = {
  tone: ["professional", "friendly"],
  emotion: ["trustworthy", "accessible"],
  audience: {
    primary: "Local customers seeking quality service",
    demographics: "All ages",
    psychographics: "Value quality and reliability",
    painPoints: ["Finding reliable service", "Getting personalized attention", "Fair pricing"]
  },
  industry: "Local service business",
  visualStyle: ["modern", "clean"],
  brandPersonality: ["reliable", "approachable", "quality-focused"],
  keyMessages: ["Quality service", "Customer-focused", "Local expertise"],
  // Enhanced for dashboard
  personality: {
    professional: 70,
    friendly: 60,
    bold: 40,
    elegant: 50,
    innovative: 55
  },
  emotions: {
    trust: 80,
    calm: 65,
    joy: 55,
    confidence: 70
  },
  audiencePersonas: [
    { name: "Sarah", role: "Young Professional", age: "25-35", values: ["Quality", "Convenience", "Value"] },
    { name: "Michael", role: "Business Owner", age: "35-50", values: ["Reliability", "Trust", "Efficiency"] }
  ]
};

const FALLBACK_DESIGN_TOKENS = {
  colors: {
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#10B981",
    neutral: {
      "50": "#F8FAFC",
      "100": "#F1F5F9",
      "200": "#E2E8F0",
      "300": "#CBD5E1",
      "400": "#94A3B8",
      "500": "#64748B",
      "600": "#475569",
      "700": "#334155",
      "800": "#1E293B",
      "900": "#0F172A"
    }
  },
  typography: {
    fontFamily: {
      heading: "Inter",
      body: "Inter"
    }
  },
  spacing: {
    scale: 1.25,
    section: "96px",
    component: "64px",
    element: "16px"
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "16px"
  },
  layout: {
    style: "centered",
    maxWidth: "1280px"
  }
};

const FALLBACK_REASONING = {
  color: "I selected a blue-based palette because it evokes trust and professionalism, which aligns with your business goals.",
  typography: "I chose Inter font for its modern appearance and excellent readability across all devices.",
  layout: "A centered layout creates visual balance and guides visitors naturally through your content."
};

function toNonEmptyString(value, fallback = '') {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  const trimmed = text.trim();
  return trimmed || fallback;
}

function toStringArray(value, fallback = []) {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => toNonEmptyString(item))
      .filter(Boolean);
    return cleaned.length ? cleaned : fallback;
  }

  if (typeof value === 'string') {
    const cleaned = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return cleaned.length ? cleaned : fallback;
  }

  return fallback;
}

function toObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function clampScore(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function toLimitedText(value, maxLength, fallback = '') {
  return toNonEmptyString(value, fallback).slice(0, maxLength);
}

function normalizeAudience(input) {
  const source = toObject(input, {});
  const psychographicsList = toStringArray(source.psychographics, []);
  const painPointsList = toStringArray(source.painPoints, []);

  return {
    primary: toNonEmptyString(source.primary, FALLBACK_BRAND_DNA.audience.primary),
    demographics: toNonEmptyString(source.demographics, FALLBACK_BRAND_DNA.audience.demographics),
    psychographics: psychographicsList.length
      ? psychographicsList.join(', ')
      : FALLBACK_BRAND_DNA.audience.psychographics,
    painPoints: painPointsList.length
      ? painPointsList
      : [...FALLBACK_BRAND_DNA.audience.painPoints]
  };
}

function normalizePersonality(raw) {
  const fallback = FALLBACK_BRAND_DNA.personality;
  const source = toObject(raw, {});
  return {
    professional: clampScore(source.professional, fallback.professional),
    friendly: clampScore(source.friendly, fallback.friendly),
    bold: clampScore(source.bold, fallback.bold),
    elegant: clampScore(source.elegant, fallback.elegant),
    innovative: clampScore(source.innovative, fallback.innovative)
  };
}

function normalizeEmotions(raw) {
  const fallback = FALLBACK_BRAND_DNA.emotions;
  const source = toObject(raw, {});
  return {
    trust: clampScore(source.trust, fallback.trust),
    calm: clampScore(source.calm, fallback.calm),
    joy: clampScore(source.joy, fallback.joy),
    confidence: clampScore(source.confidence, fallback.confidence)
  };
}

function normalizeAudiencePersonas(rawPersonas, normalizedAudience) {
  if (!Array.isArray(rawPersonas) || rawPersonas.length === 0) {
    return generatePersonasFromAudience(normalizedAudience);
  }

  const cleaned = rawPersonas
    .slice(0, 4)
    .map((persona, index) => {
      const source = toObject(persona, {});
      return {
        name: toNonEmptyString(source.name, `Persona ${index + 1}`),
        role: toNonEmptyString(source.role, 'Target Customer'),
        age: toNonEmptyString(source.age, '25-55'),
        values: makeDistinctValues(toStringArray(source.values, ['Quality', 'Trust']))
      };
    });

  return cleaned.length ? cleaned : generatePersonasFromAudience(normalizedAudience);
}

function normalizeBrandDNA(rawBrandDNA) {
  const source = toObject(rawBrandDNA, {});
  const normalizedAudience = normalizeAudience(source.audience);
  const tones = toStringArray(source.tone, FALLBACK_BRAND_DNA.tone);
  const emotions = toStringArray(source.emotion, FALLBACK_BRAND_DNA.emotion);

  return {
    ...FALLBACK_BRAND_DNA,
    tone: tones,
    emotion: emotions,
    audience: normalizedAudience,
    industry: toNonEmptyString(source.industry, FALLBACK_BRAND_DNA.industry),
    visualStyle: toStringArray(source.visualStyle, FALLBACK_BRAND_DNA.visualStyle),
    brandPersonality: toStringArray(source.brandPersonality, FALLBACK_BRAND_DNA.brandPersonality),
    keyMessages: toStringArray(source.keyMessages, FALLBACK_BRAND_DNA.keyMessages),
    personality: source.personality
      ? normalizePersonality(source.personality)
      : generatePersonalityFromTone(tones),
    emotions: source.emotions
      ? normalizeEmotions(source.emotions)
      : generateEmotionsFromEmotion(emotions, tones),
    audiencePersonas: normalizeAudiencePersonas(source.audiencePersonas, normalizedAudience)
  };
}

function normalizeDesignTokens(rawTokens) {
  const source = toObject(rawTokens, {});
  const sourceColors = toObject(source.colors, {});
  const sourceNeutral = toObject(sourceColors.neutral, {});
  const fallbackNeutral = FALLBACK_DESIGN_TOKENS.colors.neutral;

  const neutral = Object.keys(fallbackNeutral).reduce((acc, key) => {
    acc[key] = toNonEmptyString(sourceNeutral[key], fallbackNeutral[key]);
    return acc;
  }, {});

  return {
    colors: {
      primary: toNonEmptyString(sourceColors.primary, FALLBACK_DESIGN_TOKENS.colors.primary),
      secondary: toNonEmptyString(sourceColors.secondary, FALLBACK_DESIGN_TOKENS.colors.secondary),
      accent: toNonEmptyString(sourceColors.accent, FALLBACK_DESIGN_TOKENS.colors.accent),
      neutral
    },
    typography: {
      fontFamily: {
        heading: toNonEmptyString(source.typography?.fontFamily?.heading, FALLBACK_DESIGN_TOKENS.typography.fontFamily.heading),
        body: toNonEmptyString(source.typography?.fontFamily?.body, FALLBACK_DESIGN_TOKENS.typography.fontFamily.body)
      }
    },
    spacing: {
      scale: Number(source.spacing?.scale) || FALLBACK_DESIGN_TOKENS.spacing.scale,
      section: toNonEmptyString(source.spacing?.section, FALLBACK_DESIGN_TOKENS.spacing.section),
      component: toNonEmptyString(source.spacing?.component, FALLBACK_DESIGN_TOKENS.spacing.component),
      element: toNonEmptyString(source.spacing?.element, FALLBACK_DESIGN_TOKENS.spacing.element)
    },
    borderRadius: {
      small: toNonEmptyString(source.borderRadius?.small, FALLBACK_DESIGN_TOKENS.borderRadius.small),
      medium: toNonEmptyString(source.borderRadius?.medium, FALLBACK_DESIGN_TOKENS.borderRadius.medium),
      large: toNonEmptyString(source.borderRadius?.large, FALLBACK_DESIGN_TOKENS.borderRadius.large)
    },
    layout: {
      style: toNonEmptyString(source.layout?.style, FALLBACK_DESIGN_TOKENS.layout.style),
      maxWidth: toNonEmptyString(source.layout?.maxWidth, FALLBACK_DESIGN_TOKENS.layout.maxWidth)
    }
  };
}

function normalizeReasoning(rawReasoning, brandDNA, designTokens) {
  const source = toObject(rawReasoning, {});
  return {
    color: toNonEmptyString(source.color, generateReasoningFromTokens(designTokens, brandDNA).color),
    typography: toNonEmptyString(source.typography, generateReasoningFromTokens(designTokens, brandDNA).typography),
    layout: toNonEmptyString(source.layout, generateReasoningFromTokens(designTokens, brandDNA).layout)
  };
}

function normalizeHeroContent(rawHero, businessName, description) {
  const source = toObject(rawHero, {});
  const cta = toObject(source.cta, {});
  return {
    headline: toNonEmptyString(source.headline, `Welcome to ${businessName}`),
    subheadline: toLimitedText(source.subheadline, 200, toLimitedText(description, 120, `Welcome to ${businessName}`)),
    imageUrl: toNonEmptyString(source.imageUrl),
    imageAlt: toNonEmptyString(source.imageAlt, `${businessName} hero image`),
    imageSource: toNonEmptyString(source.imageSource, 'none'),
    imagePosition: toNonEmptyString(source.imagePosition, 'center'),
    overlayStrength: clampScore(source.overlayStrength, 55),
    cta: {
      text: toNonEmptyString(cta.text, 'Get Started'),
      link: toNonEmptyString(cta.link, '#contact')
    }
  };
}

function normalizeFeaturesContent(rawFeatures, businessName) {
  const source = toObject(rawFeatures, {});
  const itemsRaw = Array.isArray(source.items) ? source.items : Array.isArray(source.features) ? source.features : [];

  const normalizedItems = itemsRaw
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          icon: ['star', 'users', 'shield', 'zap'][index % 4],
          title: toLimitedText(item, 60, `Feature ${index + 1}`),
          description: 'Learn more about this benefit.'
        };
      }
      const entry = toObject(item, {});
      return {
        icon: toNonEmptyString(entry.icon, ['star', 'users', 'shield', 'zap'][index % 4]),
        title: toLimitedText(entry.title, 60, `Feature ${index + 1}`),
        description: toLimitedText(entry.description, 180, 'Learn more about this benefit.')
      };
    })
    .filter((item) => item.title);

  return {
    title: toNonEmptyString(source.title, `Why Choose ${businessName}`),
    items: normalizedItems.length
      ? normalizedItems
      : [...FALLBACK_BRAND_DNA.keyMessages].slice(0, 3).map((message, index) => ({
          icon: ['star', 'users', 'shield'][index],
          title: message,
          description: 'Built to deliver reliable outcomes for your business.'
        }))
  };
}

function normalizeTestimonialsContent(rawTestimonials) {
  const source = toObject(rawTestimonials, {});
  const listRaw = Array.isArray(source.testimonials) ? source.testimonials : [];
  const list = listRaw
    .map((entry, index) => {
      const item = toObject(entry, {});
      return {
        quote: toLimitedText(item.quote, 220, 'Great experience and excellent service.'),
        author: toNonEmptyString(item.author, `Customer ${index + 1}`),
        role: toNonEmptyString(item.role, 'Customer')
      };
    })
    .filter((item) => item.quote);

  return {
    title: toNonEmptyString(source.title, 'What Our Customers Say'),
    testimonials: list.length
      ? list
      : [
          { quote: 'Exceptional service that exceeded my expectations. Highly recommended!', author: 'Sarah M.', role: 'Happy Customer' },
          { quote: 'Professional, reliable, and truly cares about their customers.', author: 'John D.', role: 'Business Owner' },
          { quote: 'The best experience I\'ve had. Will definitely come back!', author: 'Emily R.', role: 'Regular Customer' }
        ]
  };
}

function normalizeCTAContent(rawCTA) {
  const source = toObject(rawCTA, {});
  const cta = toObject(source.cta, {});
  return {
    headline: toNonEmptyString(source.headline, 'Ready to Get Started?'),
    supportingText: toLimitedText(
      source.supportingText,
      220,
      'Join our satisfied customers and experience the difference today.'
    ),
    cta: {
      text: toNonEmptyString(cta.text, 'Contact Us'),
      link: toNonEmptyString(cta.link, '#contact')
    }
  };
}

function normalizeWebsiteContent(rawContent, businessName, description, brandDNA) {
  const source = toObject(rawContent, {});
  return {
    hero: normalizeHeroContent(source.hero, businessName, description),
    features: normalizeFeaturesContent(source.features, businessName),
    testimonials: normalizeTestimonialsContent(source.testimonials),
    cta: normalizeCTAContent(source.cta),
    footer: {
      description: toLimitedText(
        source.footer?.description,
        180,
        toLimitedText(brandDNA.keyMessages?.[0], 180, toLimitedText(description, 150, ''))
      )
    }
  };
}

function deriveBrandDNAFromInputs({ businessName, description, tone, audience }) {
  const toneList = toStringArray(tone, []);
  const descriptionText = toNonEmptyString(description, '');
  const lowerDescription = descriptionText.toLowerCase();
  const lowerBusinessName = toNonEmptyString(businessName, '').toLowerCase();
  const audienceText = toNonEmptyString(typeof audience === 'string' ? audience : JSON.stringify(audience || {}), '');

  const industry = inferIndustry(businessName, descriptionText);
  const inferredTone = toneList.length ? toneList : inferToneFromText(`${lowerBusinessName} ${lowerDescription} ${audienceText}`);
  const inferredEmotion = inferEmotionFromText(`${lowerBusinessName} ${lowerDescription} ${audienceText}`);
  const inferredVisualStyle = inferVisualStyleFromText(`${lowerBusinessName} ${lowerDescription} ${audienceText}`);
  const inferredPersonality = generatePersonalityFromTone(inferredTone);
  const inferredEmotions = generateEmotionsFromEmotion(inferredEmotion);

  return {
    ...FALLBACK_BRAND_DNA,
    tone: inferredTone,
    emotion: inferredEmotion,
    audience: {
      primary: inferAudiencePrimary(businessName, descriptionText, audience),
      demographics: inferDemographics(audienceText, descriptionText),
      psychographics: inferPsychographics(descriptionText),
      painPoints: inferPainPoints(descriptionText)
    },
    industry,
    visualStyle: inferredVisualStyle,
    brandPersonality: inferBrandPersonality(inferredTone, industry),
    keyMessages: inferKeyMessages(businessName, descriptionText, industry),
    personality: inferredPersonality,
    emotions: inferredEmotions,
    audiencePersonas: generatePersonasFromAudience({
      primary: inferAudiencePrimary(businessName, descriptionText, audience),
      demographics: inferDemographics(audienceText, descriptionText),
      psychographics: inferPsychographics(descriptionText),
      painPoints: inferPainPoints(descriptionText)
    })
  };
}

function deriveDesignTokensFromBrandDNA(brandDNA) {
  const tone = toStringArray(brandDNA?.tone, FALLBACK_BRAND_DNA.tone);
  const primaryTone = tone[0] || 'professional';

  const palette = inferPaletteFromTone(primaryTone);
  const typography = inferTypographyFromTone(primaryTone);
  const spacing = inferSpacingFromTone(primaryTone);
  const radius = inferRadiusFromTone(primaryTone);

  return {
    ...FALLBACK_DESIGN_TOKENS,
    colors: {
      ...FALLBACK_DESIGN_TOKENS.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent
    },
    typography: {
      fontFamily: {
        heading: typography.heading,
        body: typography.body
      }
    },
    spacing,
    borderRadius: radius,
    layout: {
      style: inferLayoutStyleFromTone(primaryTone),
      maxWidth: '1280px'
    }
  };
}

function buildWebsiteCacheKey({ businessName, description, tone, audience, heroImageMode }) {
  const audienceString = typeof audience === 'string' ? audience : JSON.stringify(audience || {});
  const base = JSON.stringify({
    businessName: toNonEmptyString(businessName),
    description: toNonEmptyString(description),
    tone: toNonEmptyString(tone),
    audience: toNonEmptyString(audienceString),
    heroImageMode: toNonEmptyString(heroImageMode, 'none')
  });
  return crypto.createHash('sha256').update(base).digest('hex');
}

function getWebsiteCache(cacheKey) {
  const cached = websiteGenerationCache.get(cacheKey);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > WEBSITE_CACHE_TTL_MS;
  if (isExpired) {
    websiteGenerationCache.delete(cacheKey);
    return null;
  }

  return cached.payload;
}

function setWebsiteCache(cacheKey, payload) {
  websiteGenerationCache.set(cacheKey, {
    timestamp: Date.now(),
    payload
  });
}

function svgToDataUri(svgMarkup) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup.replace(/\s+/g, ' ').trim())}`;
}

function extractSvgMarkup(rawValue) {
  const raw = toNonEmptyString(rawValue);
  if (!raw) return '';
  const fenced = raw.match(/```(?:svg)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('<svg');
  const end = candidate.lastIndexOf('</svg>');
  if (start === -1 || end === -1 || end <= start) return '';
  return candidate.slice(start, end + '</svg>'.length).trim();
}

function buildFallbackAutoHeroImageUrl({ businessName, description, industry }) {
  const safeBusinessName = toNonEmptyString(businessName, 'Business');
  const safeIndustry = toNonEmptyString(industry, 'business');
  const safeDescription = toLimitedText(description, 90, `Personalized ${safeIndustry} experience`);
  const theme = inferPaletteFromTone(inferToneFromText(`${safeBusinessName} ${safeIndustry} ${safeDescription}`));
  const signature = crypto.createHash('sha256').update(`${safeBusinessName}|${safeIndustry}|${safeDescription}`).digest('hex');
  const signatureSeed = parseInt(signature.slice(0, 8), 16);
  const variant = signatureSeed % 4;

  const motifs = {
    'coffee shop': `
      <g transform="translate(960 190)">
        <ellipse cx="250" cy="250" rx="150" ry="170" fill="#FFFFFF" fill-opacity="0.10"/>
        <path d="M170 270c0-85 55-145 138-145s138 60 138 145c0 20-16 36-36 36H206c-20 0-36-16-36-36Z" fill="#FFFFFF" fill-opacity="0.22"/>
        <path d="M210 195c0-18 14-34 32-34h56c18 0 32 16 32 34v18c0 18-14 34-32 34h-56c-18 0-32-16-32-34v-18Z" fill="#FFFFFF" fill-opacity="0.28"/>
        <path d="M155 344h204" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="16" stroke-linecap="round"/>
        <circle cx="250" cy="448" r="44" fill="#FFFFFF" fill-opacity="0.16"/>
      </g>
    `,
    restaurant: `
      <g transform="translate(940 170)">
        <rect x="40" y="30" width="420" height="430" rx="42" fill="#FFFFFF" fill-opacity="0.10"/>
        <path d="M150 180h220" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="22" stroke-linecap="round"/>
        <path d="M150 246h220" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="14" stroke-linecap="round"/>
        <path d="M150 298h170" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="14" stroke-linecap="round"/>
        <circle cx="260" cy="380" r="58" fill="#FFFFFF" fill-opacity="0.16"/>
        <circle cx="392" cy="112" r="84" fill="#FFFFFF" fill-opacity="0.12"/>
      </g>
    `,
    fitness: `
      <g transform="translate(980 180)">
        <path d="M170 246h240" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="24" stroke-linecap="round"/>
        <path d="M190 208v76" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
        <path d="M390 208v76" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
        <circle cx="80" cy="360" r="94" fill="#FFFFFF" fill-opacity="0.12"/>
        <circle cx="360" cy="110" r="126" fill="#FFFFFF" fill-opacity="0.10"/>
        <rect x="135" y="166" width="204" height="204" rx="56" fill="#FFFFFF" fill-opacity="0.14"/>
      </g>
    `,
    default: `
      <g transform="translate(960 170)">
        <rect x="20" y="50" width="380" height="460" rx="36" fill="#FFFFFF" fill-opacity="0.10"/>
        <circle cx="220" cy="210" r="72" fill="#FFFFFF" fill-opacity="0.16"/>
        <rect x="98" y="336" width="240" height="24" rx="12" fill="#FFFFFF" fill-opacity="0.18"/>
        <rect x="120" y="380" width="180" height="16" rx="8" fill="#FFFFFF" fill-opacity="0.14"/>
        <circle cx="330" cy="420" r="62" fill="#FFFFFF" fill-opacity="0.10"/>
      </g>
    `
  };

  const motif = motifs[safeIndustry] || motifs.default;
  const variantShapes = [
    `<circle cx="260" cy="730" r="190" fill="#FFFFFF" fill-opacity="0.08"/>`,
    `<circle cx="1400" cy="740" r="160" fill="#FFFFFF" fill-opacity="0.09"/>`,
    `<path d="M170 590C320 520 470 500 620 560" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="2" fill="none"/>`,
    `<path d="M1090 650C1230 585 1370 580 1490 670" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="2" fill="none"/>`
  ];

  const decorative = variantShapes
    .filter((_, index) => ((signatureSeed >> index) & 1) === 1)
    .join('\n      ');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${theme.primary}"/>
          <stop offset="50%" stop-color="${theme.secondary}"/>
          <stop offset="100%" stop-color="${theme.accent}"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1200 240) rotate(120) scale(520 520)">
          <stop stop-color="#FFFFFF" stop-opacity="0.38"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="1230" cy="220" r="320" fill="url(#glow)"/>
      ${decorative}
      <g opacity="0.18" stroke="#FFFFFF" stroke-width="2">
        <path d="M140 170C280 80 430 90 560 180" />
        <path d="M1040 650C1190 570 1320 580 1460 690" />
        <path d="M180 560C310 470 470 460 600 530" />
      </g>
      <g opacity="0.14" fill="#FFFFFF">
        <rect x="160" y="170" rx="24" width="360" height="84"/>
        <rect x="160" y="282" rx="16" width="220" height="28"/>
        <rect x="160" y="326" rx="16" width="280" height="22"/>
      </g>
      ${motif}
      <text x="170" y="438" fill="#FFFFFF" fill-opacity="0.25" font-family="Inter, sans-serif" font-size="28" font-weight="600">${safeBusinessName}</text>
      <text x="170" y="478" fill="#FFFFFF" fill-opacity="0.18" font-family="Inter, sans-serif" font-size="18">${safeIndustry}</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

async function buildAutoHeroImageUrl({ businessName, description, industry, tone }) {
  const safeBusinessName = toNonEmptyString(businessName, 'Business');
  const safeIndustry = toNonEmptyString(industry, 'business');
  const safeDescription = toLimitedText(description, 120, `Personalized ${safeIndustry} experience`);
  const safeTone = toStringArray(tone, ['professional']).slice(0, 3).join(', ');

  const prompt = `You are an illustration designer. Return ONLY JSON with key "svg".

Create a clean, modern SVG hero illustration for a website.
Brand context:
- Business: ${safeBusinessName}
- Industry: ${safeIndustry}
- Tone: ${safeTone}
- Description: ${safeDescription}

Hard requirements:
- Output must be valid JSON only: {"svg":"..."}
- The svg must be complete <svg>...</svg>
- Use width=1600 and height=900
- No external images, no fonts loading, no scripts
- No text labels inside SVG
- Visual style: professional, friendly, polished product illustration with a clear industry-specific motif
- Make each result feel distinct from other businesses by varying shapes, layout, and focal elements
- Keep contrast high and composition balanced with whitespace
- Keep file size reasonable (no extremely long paths)
`;

  try {
    const result = await generateJSON(prompt);
    const svgMarkup = extractSvgMarkup(result?.svg);
    if (svgMarkup) {
      return svgToDataUri(svgMarkup);
    }
  } catch (error) {
    console.warn('⚠️ Gemini auto hero image generation failed, using fallback SVG:', error.message);
  }

  return buildFallbackAutoHeroImageUrl({
    businessName: safeBusinessName,
    description: safeDescription,
    industry: safeIndustry
  });
}

function inferIndustry(businessName, description) {
  const text = `${toNonEmptyString(businessName).toLowerCase()} ${toNonEmptyString(description).toLowerCase()}`;
  if (/coffee|cafe|espresso|latte|barista/.test(text)) return 'coffee shop';
  if (/restaurant|diner|food|menu|cuisine|pizza|burger|bbq/.test(text)) return 'restaurant';
  if (/fitness|gym|workout|trainer|wellness|pilates|yoga/.test(text)) return 'fitness studio';
  if (/salon|spa|beauty|hair|nails/.test(text)) return 'beauty salon';
  if (/consult|agency|marketing|strategy|coach|advis/.test(text)) return 'consulting service';
  if (/shop|store|retail|boutique|ecommerce|online/.test(text)) return 'retail brand';
  if (/clinic|dental|doctor|medical|health/.test(text)) return 'healthcare practice';
  return toNonEmptyString(businessName, 'business') || 'local business';
}

function inferToneFromText(text) {
  const value = text.toLowerCase();
  const tones = [];
  if (/premium|luxury|elegant|sophisticated|high-end/.test(value)) tones.push('elegant', 'sophisticated');
  if (/friendly|warm|welcome|family|community/.test(value)) tones.push('friendly', 'warm');
  if (/bold|powerful|fast|energetic|dynamic|growth/.test(value)) tones.push('bold', 'energetic');
  if (/modern|tech|innovative|digital|smart|creative/.test(value)) tones.push('innovative', 'modern');
  if (/calm|clean|minimal|simple|clear/.test(value)) tones.push('calm', 'traditional');
  return [...new Set(tones)].slice(0, 3).length ? [...new Set(tones)].slice(0, 3) : ['professional', 'friendly'];
}

function inferEmotionFromText(text) {
  const value = text.toLowerCase();
  const emotions = [];
  if (/trust|reliable|dependable|safe/.test(value)) emotions.push('trustworthy', 'reliable');
  if (/premium|luxury|elegant/.test(value)) emotions.push('luxurious', 'sophisticated');
  if (/friendly|warm|family|community/.test(value)) emotions.push('comforting', 'accessible');
  if (/innovative|creative|modern|tech/.test(value)) emotions.push('creative', 'inspiring');
  if (/fast|energy|growth|results/.test(value)) emotions.push('exciting', 'empowering');
  return [...new Set(emotions)].slice(0, 3).length ? [...new Set(emotions)].slice(0, 3) : ['trustworthy', 'accessible'];
}

function inferVisualStyleFromText(text) {
  const value = text.toLowerCase();
  const styles = [];
  if (/premium|luxury|elegant/.test(value)) styles.push('luxurious', 'elegant');
  if (/friendly|warm|family/.test(value)) styles.push('approachable', 'organic');
  if (/modern|tech|digital|innovative/.test(value)) styles.push('tech-forward', 'modern');
  if (/clean|minimal|simple/.test(value)) styles.push('minimalist');
  if (/rustic|coffee|cafe|restaurant/.test(value)) styles.push('organic', 'rustic');
  return [...new Set(styles)].slice(0, 3).length ? [...new Set(styles)].slice(0, 3) : ['modern', 'approachable'];
}

function inferBrandPersonality(tone, industry) {
  const toneList = toStringArray(tone, FALLBACK_BRAND_DNA.tone);
  const toneSet = new Set(toneList.map((item) => item.toLowerCase()));
  const personality = [];
  if (toneSet.has('friendly') || toneSet.has('warm')) personality.push('approachable');
  if (toneSet.has('elegant') || toneSet.has('sophisticated')) personality.push('refined');
  if (toneSet.has('bold') || toneSet.has('energetic')) personality.push('confident');
  if (toneSet.has('innovative') || toneSet.has('modern')) personality.push('forward-thinking');
  if (toneSet.has('professional')) personality.push('credible');
  if (industry) personality.push(industry.includes('restaurant') ? 'welcoming' : 'customer-focused');
  return [...new Set(personality)].slice(0, 3);
}

function inferKeyMessages(businessName, description, industry) {
  const primarySubject = toNonEmptyString(businessName, 'This business');
  const focus = industry || 'brand';
  const descriptionSnippet = toLimitedText(description, 120, 'A clear, customer-focused experience.');
  return [
    `${primarySubject} delivers a ${focus} experience built around trust and clarity.`,
    descriptionSnippet,
    'Designed to feel more personal, memorable, and conversion-ready.'
  ].map((text) => toLimitedText(text, 120, text)).slice(0, 3);
}

function inferAudiencePrimary(businessName, description, audience) {
  const audienceText = typeof audience === 'string' ? audience : JSON.stringify(audience || {});
  if (audienceText.trim()) return toLimitedText(audienceText, 120, audienceText);
  const descriptor = toLimitedText(description, 70, 'local customers');
  return `People looking for ${descriptor} from ${toNonEmptyString(businessName, 'a trusted business')}`;
}

function inferDemographics(audienceText, description) {
  const text = `${audienceText} ${description}`.toLowerCase();
  if (/family|kids|parents/.test(text)) return 'Families, 30-50, local households';
  if (/young professional|professional|office/.test(text)) return 'Adults 25-45, urban or suburban professionals';
  if (/owner|b2b|business/.test(text)) return 'Business owners and decision makers, 30-55';
  if (/students|college|university/.test(text)) return 'Students and young adults, 18-30';
  return 'Adults 25-55, local and online audiences';
}

function inferPsychographics(description) {
  const text = description.toLowerCase();
  if (/premium|luxury|high-end/.test(text)) return 'Values quality, exclusivity, and polished experiences';
  if (/family|friendly|community/.test(text)) return 'Values warmth, convenience, and trust';
  if (/fast|efficient|convenient/.test(text)) return 'Values speed, reliability, and ease';
  if (/healthy|wellness|fitness/.test(text)) return 'Values health, improvement, and consistency';
  return 'Values reliability, clear communication, and good service';
}

function inferPainPoints(description) {
  const text = description.toLowerCase();
  if (/coffee|cafe|restaurant/.test(text)) return ['Finding a place they can trust', 'Wanting a memorable experience', 'Choosing quality over generic options'];
  if (/fitness|gym|wellness/.test(text)) return ['Staying motivated', 'Finding the right fit', 'Seeing clear results'];
  if (/consult|agency|coach|service/.test(text)) return ['Need confidence in expertise', 'Wanting faster outcomes', 'Comparing similar providers'];
  return ['Finding a trusted provider', 'Wanting clarity before buying', 'Looking for a better customer experience'];
}

function inferPaletteFromTone(tone) {
  const toneValue = toNonEmptyString(tone, 'professional').toLowerCase();
  if (/elegant|luxurious|sophisticated/.test(toneValue)) {
    return { primary: '#581C87', secondary: '#7C3AED', accent: '#C9A45C' };
  }
  if (/warm|friendly|approachable/.test(toneValue)) {
    return { primary: '#EA580C', secondary: '#F97316', accent: '#F59E0B' };
  }
  if (/bold|energetic/.test(toneValue)) {
    return { primary: '#DC2626', secondary: '#7C3AED', accent: '#F43F5E' };
  }
  if (/innovative|modern|tech/.test(toneValue)) {
    return { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#14B8A6' };
  }
  if (/calm/.test(toneValue)) {
    return { primary: '#0D9488', secondary: '#14B8A6', accent: '#10B981' };
  }
  return { primary: '#1E40AF', secondary: '#3B82F6', accent: '#10B981' };
}

function inferTypographyFromTone(tone) {
  const toneValue = toNonEmptyString(tone, 'professional').toLowerCase();
  if (/elegant|luxurious|sophisticated/.test(toneValue)) {
    return { heading: 'Playfair Display', body: 'Lato' };
  }
  if (/warm|friendly|approachable/.test(toneValue)) {
    return { heading: 'Poppins', body: 'Inter' };
  }
  if (/bold|energetic/.test(toneValue)) {
    return { heading: 'Montserrat', body: 'Roboto' };
  }
  if (/innovative|modern|tech/.test(toneValue)) {
    return { heading: 'Inter', body: 'Inter' };
  }
  return { heading: 'Inter', body: 'Inter' };
}

function inferSpacingFromTone(tone) {
  const toneValue = toNonEmptyString(tone, 'professional').toLowerCase();
  if (/elegant|calm|luxurious/.test(toneValue)) {
    return { scale: 1.5, section: '8rem', component: '4rem', element: '1rem' };
  }
  if (/bold|energetic/.test(toneValue)) {
    return { scale: 1.15, section: '4rem', component: '2rem', element: '0.75rem' };
  }
  return { scale: 1.25, section: '6rem', component: '3rem', element: '1rem' };
}

function inferRadiusFromTone(tone) {
  const toneValue = toNonEmptyString(tone, 'professional').toLowerCase();
  if (/elegant|luxurious/.test(toneValue)) {
    return { small: '0.125rem', medium: '0.25rem', large: '0.5rem' };
  }
  if (/friendly|warm|playful/.test(toneValue)) {
    return { small: '0.75rem', medium: '1rem', large: '1.5rem' };
  }
  return { small: '0.5rem', medium: '0.75rem', large: '1rem' };
}

function inferLayoutStyleFromTone(tone) {
  const toneValue = toNonEmptyString(tone, 'professional').toLowerCase();
  if (/premium|elegant|luxurious/.test(toneValue)) return 'centered';
  if (/bold|energetic/.test(toneValue)) return 'dynamic';
  if (/innovative|tech/.test(toneValue)) return 'minimal';
  return 'centered';
}

// Main endpoint - generates complete website
router.post('/generate', async (req, res) => {
  try {
    const { businessName, description, tone, audience, heroImageMode } = req.body;
    const safeBusinessName = toNonEmptyString(businessName);
    const safeDescription = toNonEmptyString(description);
    const safeHeroImageMode = toNonEmptyString(heroImageMode, 'none').toLowerCase();

    if (!safeBusinessName || !safeDescription) {
      return res.status(400).json({ error: 'Missing required fields: businessName and description' });
    }

    const cacheKey = buildWebsiteCacheKey({
      businessName: safeBusinessName,
      description: safeDescription,
      tone: Array.isArray(tone) ? tone.join(', ') : tone,
      audience,
      heroImageMode: safeHeroImageMode
    });
    const cachedPayload = getWebsiteCache(cacheKey);

    if (cachedPayload) {
      console.log(`⚡ Cache hit for website generation: ${safeBusinessName}`);
      return res.json({ ...cachedPayload, cache: { hit: true, ttlMs: WEBSITE_CACHE_TTL_MS } });
    }

    console.log(`🎯 Generating website for: ${safeBusinessName}`);

    let brandDNA = FALLBACK_BRAND_DNA;
    let designTokens = FALLBACK_DESIGN_TOKENS;
    let designReasoning = FALLBACK_REASONING;
    let content = normalizeWebsiteContent({}, safeBusinessName, safeDescription, FALLBACK_BRAND_DNA);
    const inputFallbackBrandDNA = deriveBrandDNAFromInputs({ businessName: safeBusinessName, description: safeDescription, tone, audience });
    const inputFallbackDesignTokens = deriveDesignTokensFromBrandDNA(inputFallbackBrandDNA);

    try {
      console.log('🤖 Generating complete website variations via Gemini (Single Call)...');
      const toneForPrompt = Array.isArray(tone) ? tone.join(', ') : toNonEmptyString(tone);
      const audienceForPrompt = typeof audience === 'string'
        ? audience
        : audience && typeof audience === 'object'
          ? JSON.stringify(audience)
          : '';
      const completePrompt = getCompleteWebsitePrompt(safeBusinessName, safeDescription, toneForPrompt, audienceForPrompt);
      const result = await generateJSON(completePrompt);

      let variations = result?.variations || [];
      if (!Array.isArray(variations) || variations.length === 0) {
        throw new Error('No variations found in Gemini response');
      }

      // Process each variation
      variations = await Promise.all(variations.map(async (v) => {
        const vBrandDNA = normalizeBrandDNA(v.brandDNA);
        const vDesignTokens = normalizeDesignTokens(v.designTokens);
        const vDesignReasoning = normalizeReasoning(v.designReasoning, vBrandDNA, vDesignTokens);
        const vContent = normalizeWebsiteContent(v.content, safeBusinessName, safeDescription, vBrandDNA);
        
        if (safeHeroImageMode === 'auto') {
          vContent.hero = {
            ...(vContent.hero || {}),
            imageUrl: await buildAutoHeroImageUrl({
              businessName: safeBusinessName,
              description: safeDescription,
              industry: vBrandDNA.industry,
              tone: vBrandDNA.tone
            }),
            imageAlt: `${safeBusinessName} hero image`,
            imageSource: 'auto',
            imagePosition: 'center',
            overlayStrength: 60
          };
        }

        const sections = [];
        sections.push({ id: 'hero-1', type: 'hero', content: vContent.hero, variant: 'centered' });
        sections.push({ id: 'features-1', type: 'features', content: vContent.features, variant: 'grid' });
        sections.push({ id: 'testimonials-1', type: 'testimonials', content: vContent.testimonials, variant: 'grid' });
        sections.push({ id: 'cta-1', type: 'cta', content: vContent.cta, variant: 'centered' });
        sections.push({ id: 'footer-1', type: 'footer', content: vContent.footer });

        return {
          id: v.id || 'variation',
          businessName: safeBusinessName,
          description: safeDescription,
          audience,
          brandDNA: vBrandDNA,
          designTokens: vDesignTokens,
          designReasoning: vDesignReasoning,
          sections,
          content: vContent
        };
      }));

      console.log('✅ Website generated successfully!');
      
      const responsePayload = {
        businessName: safeBusinessName,
        description: safeDescription,
        variations
      };

      setWebsiteCache(cacheKey, responsePayload);
      return res.json({ ...responsePayload, cache: { hit: false, ttlMs: WEBSITE_CACHE_TTL_MS } });

    } catch (error) {
      console.warn('⚠️ Website generation failed, using fallbacks entirely:', error.message);
      brandDNA = normalizeBrandDNA(inputFallbackBrandDNA);
      designTokens = normalizeDesignTokens(inputFallbackDesignTokens);
      designReasoning = normalizeReasoning({}, brandDNA, designTokens);
      content = normalizeWebsiteContent({}, safeBusinessName, safeDescription, brandDNA);

      if (safeHeroImageMode === 'auto') {
        content.hero = {
          ...(content.hero || {}),
          imageUrl: await buildAutoHeroImageUrl({
            businessName: safeBusinessName,
            description: safeDescription,
            industry: brandDNA.industry,
            tone: brandDNA.tone
          }),
          imageAlt: `${safeBusinessName} hero image`,
          imageSource: 'auto',
          imagePosition: 'center',
          overlayStrength: 60
        };
      }
      
      const sections = [];
      sections.push({ id: 'hero-1', type: 'hero', content: content.hero, variant: 'centered' });
      sections.push({ id: 'features-1', type: 'features', content: content.features, variant: 'grid' });
      sections.push({ id: 'testimonials-1', type: 'testimonials', content: content.testimonials, variant: 'grid' });
      sections.push({ id: 'cta-1', type: 'cta', content: content.cta, variant: 'centered' });
      sections.push({ id: 'footer-1', type: 'footer', content: content.footer });

      const fallbackVariation = {
        id: 'confident',
        businessName: safeBusinessName,
        description: safeDescription,
        audience,
        brandDNA,
        designTokens,
        designReasoning,
        sections,
        content
      };

      const responsePayload = {
        businessName: safeBusinessName,
        description: safeDescription,
        variations: [fallbackVariation, { ...fallbackVariation, id: 'approachable' }, { ...fallbackVariation, id: 'premium' }]
      };

      setWebsiteCache(cacheKey, responsePayload);
      return res.json({ ...responsePayload, cache: { hit: false, ttlMs: WEBSITE_CACHE_TTL_MS } });
    }
  } catch (error) {
    console.error('❌ Website generation error:', error);
    res.status(500).json({
      error: 'Failed to generate website',
      details: error.message
    });
  }
});

// Helper function to generate personality scores from tone
function generatePersonalityFromTone(tones) {
  const normalizedTones = toStringArray(tones, FALLBACK_BRAND_DNA.tone);
  const toneToPersonality = {
    professional: { professional: 85, friendly: 40, bold: 50, elegant: 60, innovative: 55 },
    friendly: { professional: 50, friendly: 90, bold: 45, elegant: 40, innovative: 50 },
    bold: { professional: 60, friendly: 55, bold: 90, elegant: 50, innovative: 70 },
    elegant: { professional: 75, friendly: 45, bold: 40, elegant: 95, innovative: 55 },
    playful: { professional: 35, friendly: 85, bold: 60, elegant: 30, innovative: 65 },
    modern: { professional: 65, friendly: 55, bold: 55, elegant: 60, innovative: 85 },
    warm: { professional: 55, friendly: 85, bold: 40, elegant: 50, innovative: 45 },
    innovative: { professional: 60, friendly: 50, bold: 70, elegant: 55, innovative: 95 },
    traditional: { professional: 80, friendly: 50, bold: 35, elegant: 70, innovative: 25 }
  };

  let result = { professional: 60, friendly: 60, bold: 50, elegant: 50, innovative: 60 };

  normalizedTones.forEach(tone => {
    const mapping = toneToPersonality[tone.toLowerCase()];
    if (mapping) {
      Object.keys(mapping).forEach(key => {
        result[key] = Math.max(result[key], mapping[key]);
      });
    }
  });

  return result;
}

// Helper function to generate emotion scores
function generateEmotionsFromEmotion(emotions, tones = []) {
  const normalizedEmotions = toStringArray(emotions, FALLBACK_BRAND_DNA.emotion);
  const normalizedTones = toStringArray(tones, FALLBACK_BRAND_DNA.tone);
  const emotionMapping = {
    trustworthy: { trust: 90, calm: 70, joy: 55, confidence: 80 },
    exciting: { trust: 60, calm: 35, joy: 85, confidence: 75 },
    calm: { trust: 75, calm: 95, joy: 60, confidence: 65 },
    inspiring: { trust: 70, calm: 55, joy: 80, confidence: 85 },
    luxurious: { trust: 75, calm: 70, joy: 65, confidence: 90 },
    accessible: { trust: 80, calm: 65, joy: 75, confidence: 60 },
    energetic: { trust: 55, calm: 30, joy: 90, confidence: 80 },
    sophisticated: { trust: 80, calm: 70, joy: 50, confidence: 85 }
  };

  let result = { trust: 68, calm: 58, joy: 60, confidence: 68 };

  normalizedEmotions.forEach(emotion => {
    const mapping = emotionMapping[emotion.toLowerCase()];
    if (mapping) {
      Object.keys(mapping).forEach(key => {
        result[key] = Math.max(result[key], mapping[key]);
      });
    }
  });

  const toneEmotionBoost = {
    professional: { trust: 8, confidence: 8 },
    friendly: { joy: 8, calm: 5 },
    bold: { confidence: 12, joy: 6 },
    elegant: { confidence: 10, calm: 6 },
    playful: { joy: 12, calm: -4 },
    innovative: { confidence: 7, joy: 5 },
    warm: { calm: 10, trust: 5 },
    trustworthy: { trust: 12, calm: 4 },
    energetic: { joy: 12, calm: -8 },
    traditional: { trust: 8, calm: 8 }
  };

  normalizedTones.forEach((tone) => {
    const mapping = toneEmotionBoost[tone.toLowerCase()];
    if (!mapping) return;
    Object.keys(mapping).forEach((key) => {
      const next = (result[key] || 60) + mapping[key];
      result[key] = Math.max(25, Math.min(98, next));
    });
  });

  return result;
}

// Helper function to generate audience personas
function generatePersonasFromAudience(audienceData) {
  const audience = normalizeAudience(audienceData);
  if (!audience) {
    return [
      { name: "Alex", role: "Target Customer", age: "25-45", values: ["Quality", "Value", "Trust"] },
      { name: "Jordan", role: "Decision Maker", age: "30-55", values: ["Reliability", "Results", "Service"] }
    ];
  }

  const primary = toNonEmptyString(audience.primary, "General audience");
  const demographics = toNonEmptyString(audience.demographics, "All ages");
  const psychographics = toStringArray(audience.psychographics, []);
  const painPoints = Array.isArray(audience.painPoints) ? audience.painPoints : [];
  const firstPersonaValues = makeDistinctValues(psychographics.length ? psychographics.slice(0, 4) : ["Quality", "Value", "Trust"]);
  const secondPersonaValues = makeDistinctValues(
    painPoints.length
      ? painPoints.slice(0, 4).map((p) => solvePainPoint(p))
      : ["Trust", "Service", "Reliability"]
  );

  return [
    {
      name: "Alex",
      role: primary.substring(0, 30),
      age: extractAgeRange(demographics),
      values: firstPersonaValues
    },
    {
      name: "Jordan",
      role: "Ideal Customer",
      age: extractAgeRange(demographics),
      values: secondPersonaValues
    }
  ];
}

function extractAgeRange(demographics) {
  const safeDemographics = toNonEmptyString(demographics, "25-55");
  const match = safeDemographics.match(/(\d+)[-–]?(\d+)?/);
  if (match) {
    return match[2] ? `${match[1]}-${match[2]}` : `${match[1]}+`;
  }
  return "25-55";
}

function solvePainPoint(painPoint) {
  const safePainPoint = toNonEmptyString(painPoint).toLowerCase();
  if (!safePainPoint) return "Quality";
  // Convert pain point to positive value
  const conversions = {
    "price": "Value",
    "cost": "Value",
    "quality": "Quality",
    "trust": "Trust",
    "reliable": "Reliability",
    "fast": "Speed",
    "convenient": "Convenience",
    "slow": "Speed",
    "confusing": "Clarity",
    "overwhelm": "Simplicity",
    "inconsistent": "Consistency",
    "crowded": "Comfort",
    "generic": "Originality"
  };

  for (const [key, value] of Object.entries(conversions)) {
    if (safePainPoint.includes(key)) {
      return value;
    }
  }
  const words = safePainPoint.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const firstWord = words[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }
  return "Quality";
}

function makeDistinctValues(values) {
  const unique = [];
  values.forEach((value) => {
    const safe = toNonEmptyString(value);
    if (!safe) return;
    const already = unique.some((item) => item.toLowerCase() === safe.toLowerCase());
    if (!already) unique.push(safe);
  });
  return unique.slice(0, 3).length ? unique.slice(0, 3) : ["Quality", "Trust", "Value"];
}

// Helper function to generate reasoning from tokens and brand
function generateReasoningFromTokens(tokens, brandDNA) {
  const primaryColor = tokens.colors?.primary || '#3B82F6';
  const font = tokens.typography?.fontFamily?.heading || 'Inter';
  const layoutStyle = tokens.layout?.style || 'centered';
  const tones = brandDNA.tone || ['professional'];
  const industry = brandDNA.industry || 'business';

  return {
    color: `I chose ${primaryColor} because it evokes ${tones[0]} and resonates with your ${industry} audience. This color creates the ${brandDNA.emotion?.[0] || 'trustworthy'} feeling your brand aims to convey.`,
    typography: `${font} was selected for its ${tones.includes('modern') ? 'modern, clean appearance' : 'excellent readability'} that complements your ${tones[0]} brand tone. It works well for your ${brandDNA.audience?.primary || 'target audience'}.`,
    layout: `A ${layoutStyle} layout aligns with your ${tones[0]} brand positioning and creates the visual hierarchy needed to communicate your key messages effectively to ${brandDNA.audience?.primary || 'your audience'}.`
  };
}

module.exports = router;
