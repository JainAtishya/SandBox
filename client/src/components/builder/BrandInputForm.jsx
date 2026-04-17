import { useState } from 'react';
import { generateWebsite } from '../../services/api';
import { Sparkles, Target, MessageSquare, Users, Brain, Palette, Zap, CheckCircle2 } from 'lucide-react';

// Animated background particles
const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-blue-500/20 rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

// Loading animation component
const LoadingAnimation = ({ step, thoughts = [] }) => {
  const steps = [
    { text: 'Analyzing brand identity...', icon: Brain },
    { text: 'Extracting brand DNA...', icon: Target },
    { text: 'Generating design system...', icon: Palette },
    { text: 'Creating your website...', icon: Zap },
  ];
  const currentStepIndex = Math.max(steps.findIndex((s) => step.includes(s.text.split('...')[0])), 0);
  
  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto text-center p-8">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 animate-pulse" />
          <div
            className="absolute inset-4 rounded-full flex items-center justify-center"
            style={{ backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)' }}
          >
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">AI is Working</h2>
        <p className="text-lg text-blue-400 mb-8">{step}</p>
        
        <div className="flex justify-center gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div 
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-600 scale-110' : isDone ? 'bg-green-600/70' : 'bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive || isDone ? 'text-white' : 'text-slate-500'}`} />
              </div>
            );
          })}
        </div>

        {thoughts.length > 0 && (
          <div className="mt-8 text-left rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">AI thinking</p>
            <div className="space-y-2">
              {thoughts.map((thought, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span className={index <= currentStepIndex ? 'text-slate-200' : 'text-slate-500'}>{thought}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const locationTypes = ['Local neighborhood', 'City-wide', 'Online only', 'Regional'];
const businessGoals = ['More walk-ins', 'More calls/leads', 'Online bookings', 'Stronger brand trust'];
const differentiators = [
  'Best quality',
  'Fastest service',
  'Most affordable',
  'Family-owned trust',
  'Premium experience',
  'Highly personalized service'
];
const toneChipClassMap = {
  blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20',
  orange: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20',
  pink: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20',
  cyan: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20'
};
const featurePillClassMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' }
};

const BASE_FORM_DATA = {
  mode: 'guided',
  businessName: '',
  description: '',
  tone: '',
  audience: '',
  category: '',
  mainService: '',
  idealCustomer: '',
  locationType: '',
  goal: '',
  differentiator: '',
  pricePosition: '',
  highlights: '',
  heroImageMode: 'none',
  heroImageDataUrl: ''
};

const DEMO_PRESETS = {
  coffee: {
    ...BASE_FORM_DATA,
    businessName: 'Bean & Stone Coffee Collective',
    category: 'Specialty coffee roastery',
    mainService: 'Single-origin coffee roasting and wholesale supply for specialty cafes',
    idealCustomer: 'Specialty cafe owners, premium coffee enthusiasts, and design-conscious professionals',
    locationType: 'City-wide',
    goal: 'More calls/leads',
    differentiator: 'Premium experience',
    pricePosition: 'Premium',
    highlights: 'Japanese-influenced minimalist aesthetic, direct-trade beans, precision roasting, curated tasting notes',
    tone: 'minimalist, refined, artisanal, premium, calm',
    audience: 'Specialty cafe owners and coffee connoisseurs aged 28-55',
    description: 'Boutique Chandigarh coffee roastery with a minimalist, Japanese-influenced brand. We source single-origin beans and offer precise roast profiles for specialty cafes and conscious home brewers. The website should feel quiet, premium, intentional, and craftsmanship-first.',
    heroImageMode: 'upload'
  },
  fitness: {
    ...BASE_FORM_DATA,
    businessName: 'Flow Yoga Studios',
    category: 'Yoga and wellness studio',
    mainService: 'Beginner-friendly yoga classes, guided flows, and community wellness sessions',
    idealCustomer: 'Busy professionals, yoga beginners, and health-focused local residents',
    locationType: 'Local neighborhood',
    goal: 'Online bookings',
    differentiator: 'Highly personalized service',
    pricePosition: 'Mid-range',
    highlights: 'Community-first approach, warm instructors, flexible schedules, inclusive classes for all levels',
    tone: 'energetic, welcoming, inclusive, modern, encouraging',
    audience: 'Working professionals and first-time yoga learners aged 24-45',
    description: 'Community-focused yoga studio in Chandigarh helping beginners and busy professionals build sustainable wellness routines. The brand should feel energetic, warm, and trustworthy with clear class booking actions and approachable language.',
    heroImageMode: 'upload'
  }
};

function buildSmartDescription(formData) {
  const lines = [];

  if (formData.category || formData.mainService) {
    lines.push(
      `${formData.businessName || 'This business'} is a ${formData.category || 'local business'}${formData.mainService ? ` focused on ${formData.mainService}` : ''}.`
    );
  }
  if (formData.locationType || formData.idealCustomer) {
    lines.push(
      `It primarily serves ${formData.idealCustomer || 'local customers'}${formData.locationType ? ` in a ${formData.locationType.toLowerCase()} market` : ''}.`
    );
  }
  if (formData.goal) {
    lines.push(`Main website goal: ${formData.goal.toLowerCase()}.`);
  }
  if (formData.differentiator) {
    lines.push(`What makes it unique: ${formData.differentiator}.`);
  }
  if (formData.pricePosition) {
    lines.push(`Price positioning: ${formData.pricePosition}.`);
  }
  if (formData.highlights) {
    lines.push(`Highlights: ${formData.highlights}.`);
  }
  if (formData.description?.trim()) {
    lines.push(`Owner notes: ${formData.description.trim()}`);
  }

  return lines.join(' ');
}

export default function BrandInputForm({ onComplete }) {
  const [formData, setFormData] = useState(DEMO_PRESETS.coffee);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleHeroImageUpload = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setFormData((prev) => ({
      ...prev,
      heroImageMode: 'upload',
      heroImageDataUrl: dataUrl
    }));
  };

  const getThinkingLines = () => ([
    `Understanding ${formData.businessName || 'your business'} context and positioning.`,
    `Identifying uniqueness${formData.differentiator ? `: ${formData.differentiator.toLowerCase()}` : ' from your details'}.`,
    `Mapping tone and audience${(formData.idealCustomer || formData.audience) ? ` for ${formData.idealCustomer || formData.audience}` : ''}.`,
    `Building a website style${formData.pricePosition ? ` with ${formData.pricePosition.toLowerCase()} feel` : ''}.`,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const composedDescription = buildSmartDescription(formData);
      const mergedTone = formData.tone;
      const mergedAudience = formData.audience || formData.idealCustomer;

      setLoadingStep('Analyzing your brand identity...');
      
      setLoadingStep('Extracting brand DNA...');
      
      const result = await generateWebsite({
        businessName: formData.businessName,
        description: composedDescription,
        tone: mergedTone,
        audience: mergedAudience,
        heroImageMode: formData.heroImageMode
      });

      const personalizedResult = await personalizeHeroResult(result, {
        businessName: formData.businessName,
        description: composedDescription,
        heroImageMode: formData.heroImageMode,
        heroImageDataUrl: formData.heroImageDataUrl
      });
      
      setLoadingStep('Generating design system...');
      
      setLoadingStep('Creating your website...');
      
      onComplete(personalizedResult);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const toneExamples = [
    { name: 'Professional', color: 'blue' },
    { name: 'Friendly', color: 'green' },
    { name: 'Bold', color: 'orange' },
    { name: 'Elegant', color: 'purple' },
    { name: 'Playful', color: 'pink' },
    { name: 'Innovative', color: 'cyan' },
  ];

  const industryTemplates = [
    { key: 'coffee', name: '☕ Coffee Shop', helper: 'Minimalist premium local brand' },
    { key: 'fitness', name: '💪 Fitness Studio', helper: 'Energetic community local brand' },
  ];

  const hasEnoughInput =
    formData.businessName &&
    (formData.description.trim() || formData.mainService.trim() || formData.category.trim());

  return (
    <>
      {loading && <LoadingAnimation step={loadingStep} thoughts={getThinkingLines()} />}
      
      <div className="relative min-h-screen">
        <ParticleBackground />
        
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Brand Intelligence Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Transform Your Brand Into
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa 0%, #c084fc 100%)' }}
              > a Stunning Website</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our AI doesn't just generate websites — it <span className="text-white font-medium">understands</span> your brand 
              and creates a design system that truly represents you.
            </p>
          </div>

          {/* Quick Templates */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-3 text-center">Quick start with a template:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {industryTemplates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => setFormData(DEMO_PRESETS[template.key])}
                  className={`px-4 py-2 border rounded-xl text-sm transition-all ${
                    formData.businessName === DEMO_PRESETS[template.key].businessName
                      ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                      : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block">{template.name}</span>
                  <span className="block text-[11px] text-slate-400">{template.helper}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-slate-300 mb-3">How would you like to share your business details?</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'guided' })}
                    className={`px-4 py-3 rounded-xl border text-sm text-left transition ${
                      formData.mode === 'guided' ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-slate-700 bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="font-semibold block">Guided form (Recommended)</span>
                    <span className="text-xs text-slate-400">Simple questions for non-technical owners.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'manual' })}
                    className={`px-4 py-3 rounded-xl border text-sm text-left transition ${
                      formData.mode === 'manual' ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-slate-700 bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="font-semibold block">Write manually</span>
                    <span className="text-xs text-slate-400">Describe everything in your own words.</span>
                  </button>
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500"
                  placeholder="e.g., Bean & Brew Coffee House"
                />
              </div>

              {formData.mode === 'guided' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Business category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500"
                        placeholder="e.g., salon, bakery, dental clinic"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Main service or product</label>
                      <input
                        type="text"
                        value={formData.mainService}
                        onChange={(e) => setFormData({ ...formData, mainService: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500"
                        placeholder="e.g., bridal makeup, home cleaning, pizza delivery"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Ideal customer</label>
                      <input
                        type="text"
                        value={formData.idealCustomer}
                        onChange={(e) => setFormData({ ...formData, idealCustomer: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500"
                        placeholder="e.g., local families, working professionals"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Where do you serve?</label>
                      <select
                        value={formData.locationType}
                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
                      >
                        <option value="">Select</option>
                        {locationTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Main website goal</label>
                      <select
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
                      >
                        <option value="">Select</option>
                        {businessGoals.map((goal) => (
                          <option key={goal} value={goal}>{goal}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">Price positioning</label>
                      <select
                        value={formData.pricePosition}
                        onChange={(e) => setFormData({ ...formData, pricePosition: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
                      >
                        <option value="">Select</option>
                        <option value="Budget-friendly">Budget-friendly</option>
                        <option value="Mid-range">Mid-range</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">What makes you different?</label>
                    <div className="flex flex-wrap gap-2">
                      {differentiators.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFormData({ ...formData, differentiator: item })}
                          className={`px-3 py-2 rounded-full text-xs border transition ${
                            formData.differentiator === item
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-slate-700 bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  {formData.mode === 'guided' ? 'Extra owner notes (optional)' : 'Business Description *'}
                </label>
                <textarea
                  required={formData.mode === 'manual'}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500 h-32 resize-none"
                  placeholder={
                    formData.mode === 'guided'
                      ? 'Any special requests? Competitors, style references, neighborhood vibe, etc.'
                      : 'Describe your business, what you offer, what makes you unique, and the experience you want customers to have...'
                  }
                />
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Hero Image Personalization</p>
                <p className="text-xs text-slate-400">
                  Choose how your hero should look: upload your own image, or keep gradient-only.
                </p>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    { value: 'none', label: 'No image', hint: 'Brand gradient background only' },
                    { value: 'upload', label: 'Upload my image', hint: 'Best for personal branding' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroImageMode: option.value }))}
                      className={`text-left px-3 py-2 rounded-lg border transition ${
                        formData.heroImageMode === option.value
                          ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                          : 'border-slate-700 bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span className="text-sm font-medium block">{option.label}</span>
                      <span className="text-[11px] text-slate-400">{option.hint}</span>
                    </button>
                  ))}
                </div>

                {formData.heroImageMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleHeroImageUpload(e.target.files?.[0])}
                      className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500"
                    />
                    {formData.heroImageDataUrl && (
                      <div className="rounded-lg border border-slate-700 overflow-hidden max-w-xs">
                        <img src={formData.heroImageDataUrl} alt="Hero preview" className="w-full h-28 object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Brand Tone (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder:text-slate-500"
                    placeholder="e.g., warm, friendly, professional"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {toneExamples.map((tone) => (
                      <button
                        key={tone.name}
                        type="button"
                        onClick={() => setFormData({
                          ...formData, 
                          tone: formData.tone ? `${formData.tone}, ${tone.name.toLowerCase()}` : tone.name.toLowerCase()
                        })}
                        className={`px-3 py-1 text-xs border rounded-full transition ${toneChipClassMap[tone.color] || toneChipClassMap.blue}`}
                      >
                        + {tone.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    Target Audience (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-white placeholder:text-slate-500"
                    placeholder="e.g., young professionals, local families"
                  />
                </div>
              </div>

              {formData.mode === 'guided' && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">AI input preview</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {buildSmartDescription(formData) || 'Fill a few guided fields above. We will convert them into a high-quality AI brief automatically.'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !hasEnoughInput}
                className="w-full text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                style={{ backgroundImage: 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)' }}
              >
                <Brain className="w-5 h-5" />
                Analyze My Brand & Generate Website
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-4 gap-4">
            {[
              { icon: Brain, title: 'Brand DNA', desc: 'AI extracts personality & tone', color: 'blue' },
              { icon: Palette, title: 'Design System', desc: 'Colors, fonts, spacing', color: 'purple' },
              { icon: Target, title: 'Audience Fit', desc: 'Tailored to your customers', color: 'green' },
              { icon: Zap, title: 'SLDS 2', desc: 'Enterprise-grade tokens', color: 'orange' },
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${(featurePillClassMap[feature.color] || featurePillClassMap.blue).bg}`}>
                  <feature.icon className={`w-5 h-5 ${(featurePillClassMap[feature.color] || featurePillClassMap.blue).text}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* SLDS Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/30 rounded-full text-slate-500 text-xs">
              <span>Powered by</span>
              <span className="font-semibold text-slate-400">Salesforce Lightning Design System 2</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function personalizeHeroResult(result, options) {
  const base = result && typeof result === 'object' ? result : {};
  const mode = options?.heroImageMode || 'none';
  if (mode !== 'upload' || !options?.heroImageDataUrl) {
    return base;
  }

  const heroWithImage = {
    ...(base.content?.hero || {}),
    imageUrl: options.heroImageDataUrl,
    imageAlt: `${options.businessName || 'Business'} hero image`,
    imageSource: 'upload',
    imagePosition: 'center',
    overlayStrength: 50
  };

  const nextSections = Array.isArray(base.sections)
    ? base.sections.map((section) =>
        section.type === 'hero' ? { ...section, content: heroWithImage } : section
      )
    : base.sections;

  const colorSync = await extractPaletteFromImage(options.heroImageDataUrl).catch(() => null);
  const nextDesignTokens = colorSync
    ? {
        ...(base.designTokens || {}),
        colors: {
          ...(base.designTokens?.colors || {}),
          primary: colorSync.primary,
          secondary: colorSync.secondary,
          accent: colorSync.accent
        }
      }
    : base.designTokens;

  return {
    ...base,
    designTokens: nextDesignTokens,
    content: {
      ...(base.content || {}),
      hero: heroWithImage
    },
    sections: nextSections
  };
}

async function extractPaletteFromImage(imageUrl) {
  const average = await getAverageRgb(imageUrl);
  const hsl = rgbToHsl(average.r, average.g, average.b);

  return {
    primary: rgbToHex(average.r, average.g, average.b),
    secondary: hslToHex((hsl.h + 28) % 360, Math.min(0.72, hsl.s + 0.08), Math.max(0.22, hsl.l - 0.1)),
    accent: hslToHex((hsl.h + 180) % 360, Math.min(0.8, hsl.s + 0.1), Math.max(0.35, hsl.l + 0.08))
  };
}

function getAverageRgb(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 16) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }

      if (!count) return reject(new Error('Unable to sample image colors'));
      resolve({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
      });
    };
    image.onerror = () => reject(new Error('Failed to load image for color sync'));
    image.src = imageUrl;
  });
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);
  return rgbToHex(r, g, b);
}
