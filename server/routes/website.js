const express = require('express');
const router = express.Router();
const { generateJSON } = require('../services/geminiService');
const { getBrandDNAPrompt } = require('../prompts/brandDNA');
const { getDesignDecisionsPrompt } = require('../prompts/designDecisions');
const { 
  getHeroContentPrompt, 
  getFeaturesContentPrompt, 
  getTestimonialsContentPrompt, 
  getCTAContentPrompt 
} = require('../prompts/contentGeneration');

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

// Main endpoint - generates complete website
router.post('/generate', async (req, res) => {
  try {
    const { businessName, description, tone, audience } = req.body;

    if (!businessName || !description) {
      return res.status(400).json({ error: 'Missing required fields: businessName and description' });
    }

    console.log(`🎯 Generating website for: ${businessName}`);

    // Step 1: Extract Brand DNA with enhanced personality data
    console.log('📊 Step 1: Extracting Brand DNA...');
    let brandDNA;
    try {
      const brandPrompt = getBrandDNAPrompt(businessName, description, tone, audience);
      brandDNA = await generateJSON(brandPrompt);
      
      // Ensure personality scores exist
      if (!brandDNA.personality) {
        brandDNA.personality = generatePersonalityFromTone(brandDNA.tone || []);
      }
      if (!brandDNA.emotions) {
        brandDNA.emotions = generateEmotionsFromEmotion(brandDNA.emotion || []);
      }
      if (!brandDNA.audiencePersonas) {
        brandDNA.audiencePersonas = generatePersonasFromAudience(brandDNA.audience);
      }
      
      console.log('✅ Brand DNA extracted');
    } catch (error) {
      console.warn('⚠️ Brand DNA generation failed, using fallback:', error.message);
      brandDNA = FALLBACK_BRAND_DNA;
    }

    // Step 2: Generate Design Tokens with Reasoning
    console.log('🎨 Step 2: Generating Design Tokens...');
    let designTokens;
    let designReasoning;
    try {
      const designPrompt = getDesignDecisionsPrompt(brandDNA);
      const designResult = await generateJSON(designPrompt);
      
      // Extract reasoning if included in response
      if (designResult.reasoning) {
        designReasoning = designResult.reasoning;
        delete designResult.reasoning;
        designTokens = designResult;
      } else {
        designTokens = designResult;
        designReasoning = generateReasoningFromTokens(designTokens, brandDNA);
      }
      
      console.log('✅ Design tokens generated');
    } catch (error) {
      console.warn('⚠️ Design tokens generation failed, using fallback:', error.message);
      designTokens = FALLBACK_DESIGN_TOKENS;
      designReasoning = FALLBACK_REASONING;
    }

    // Step 3: Generate Content for each section (parallel for speed)
    console.log('📝 Step 3: Generating Content...');
    const sections = [];
    const content = {};

    const [
      heroContent,
      featuresContent,
      testimonialsContent,
      ctaContent
    ] = await Promise.all([
      generateSectionContent({
        sectionName: 'Hero',
        promptFactory: () => getHeroContentPrompt(businessName, brandDNA),
        fallback: {
          headline: `Welcome to ${businessName}`,
          subheadline: description.substring(0, 120),
          cta: { text: 'Get Started', link: '#contact' }
        }
      }),
      generateSectionContent({
        sectionName: 'Features',
        promptFactory: () => getFeaturesContentPrompt(businessName, brandDNA),
        fallback: {
          title: `Why Choose ${businessName}`,
          items: [
            { icon: 'star', title: 'Quality Service', description: 'We deliver exceptional quality in everything we do.' },
            { icon: 'users', title: 'Customer Focus', description: 'Your satisfaction is our top priority.' },
            { icon: 'shield', title: 'Trusted & Reliable', description: 'Count on us to deliver consistent results.' },
            { icon: 'zap', title: 'Fast & Efficient', description: 'Quick turnaround without compromising quality.' }
          ]
        }
      }),
      generateSectionContent({
        sectionName: 'Testimonials',
        promptFactory: () => getTestimonialsContentPrompt(businessName, brandDNA),
        fallback: {
          title: 'What Our Customers Say',
          testimonials: [
            { quote: 'Exceptional service that exceeded my expectations. Highly recommended!', author: 'Sarah M.', role: 'Happy Customer' },
            { quote: 'Professional, reliable, and truly cares about their customers.', author: 'John D.', role: 'Business Owner' },
            { quote: 'The best experience I\'ve had. Will definitely come back!', author: 'Emily R.', role: 'Regular Customer' }
          ]
        }
      }),
      generateSectionContent({
        sectionName: 'CTA',
        promptFactory: () => getCTAContentPrompt(businessName, brandDNA),
        fallback: {
          headline: 'Ready to Get Started?',
          supportingText: 'Join our satisfied customers and experience the difference today.',
          cta: { text: 'Contact Us', link: '#contact' }
        }
      })
    ]);

    sections.push({ id: 'hero-1', type: 'hero', content: heroContent, variant: 'centered' });
    sections.push({ id: 'features-1', type: 'features', content: featuresContent, variant: 'grid' });
    sections.push({ id: 'testimonials-1', type: 'testimonials', content: testimonialsContent, variant: 'grid' });
    sections.push({ id: 'cta-1', type: 'cta', content: ctaContent, variant: 'centered' });

    content.hero = heroContent;
    content.features = featuresContent;
    content.testimonials = testimonialsContent;
    content.cta = ctaContent;

    // Footer Section
    sections.push({
      id: 'footer-1',
      type: 'footer',
      content: {
        description: brandDNA.keyMessages?.[0] || description.substring(0, 150)
      }
    });

    console.log('🎉 Website generation complete!');

    // Return complete website data with enhanced structure
    res.json({
      businessName,
      description,
      audience,
      brandDNA,
      designTokens,
      designReasoning,
      sections,
      content
    });

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
  
  tones.forEach(tone => {
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
function generateEmotionsFromEmotion(emotions) {
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
  
  let result = { trust: 70, calm: 60, joy: 60, confidence: 70 };
  
  emotions.forEach(emotion => {
    const mapping = emotionMapping[emotion.toLowerCase()];
    if (mapping) {
      Object.keys(mapping).forEach(key => {
        result[key] = Math.max(result[key], mapping[key]);
      });
    }
  });
  
  return result;
}

// Helper function to generate audience personas
function generatePersonasFromAudience(audienceData) {
  if (!audienceData) {
    return [
      { name: "Alex", role: "Target Customer", age: "25-45", values: ["Quality", "Value", "Trust"] },
      { name: "Jordan", role: "Decision Maker", age: "30-55", values: ["Reliability", "Results", "Service"] }
    ];
  }
  
  const primary = audienceData.primary || "General audience";
  const demographics = audienceData.demographics || "All ages";
  
  return [
    { 
      name: "Alex", 
      role: primary.substring(0, 30), 
      age: extractAgeRange(demographics), 
      values: audienceData.psychographics ? audienceData.psychographics.split(',').slice(0, 3).map(s => s.trim()) : ["Quality", "Value"]
    },
    { 
      name: "Jordan", 
      role: "Ideal Customer", 
      age: extractAgeRange(demographics), 
      values: audienceData.painPoints ? audienceData.painPoints.slice(0, 3).map(p => solvePainPoint(p)) : ["Trust", "Service"]
    }
  ];
}

function extractAgeRange(demographics) {
  const match = demographics.match(/(\d+)[-–]?(\d+)?/);
  if (match) {
    return match[2] ? `${match[1]}-${match[2]}` : `${match[1]}+`;
  }
  return "25-55";
}

function solvePainPoint(painPoint) {
  // Convert pain point to positive value
  const conversions = {
    "price": "Value",
    "cost": "Value",
    "quality": "Quality",
    "trust": "Trust",
    "reliable": "Reliability",
    "fast": "Speed",
    "convenient": "Convenience"
  };
  
  for (const [key, value] of Object.entries(conversions)) {
    if (painPoint.toLowerCase().includes(key)) {
      return value;
    }
  }
  return "Quality";
}

async function generateSectionContent({ sectionName, promptFactory, fallback }) {
  try {
    const result = await generateJSON(promptFactory());
    console.log(`✅ ${sectionName} content generated`);
    return result;
  } catch (error) {
    console.warn(`⚠️ ${sectionName} content failed:`, error.message);
    return fallback;
  }
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
