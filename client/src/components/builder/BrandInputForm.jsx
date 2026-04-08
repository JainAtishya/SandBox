import { useState } from 'react';
import { generateWebsite } from '../../services/api';
import { Loader2, Sparkles, Target, MessageSquare, Users, Brain, Palette, Zap } from 'lucide-react';

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
const LoadingAnimation = ({ step }) => {
  const steps = [
    { text: 'Analyzing brand identity...', icon: Brain },
    { text: 'Extracting brand DNA...', icon: Target },
    { text: 'Generating design system...', icon: Palette },
    { text: 'Creating your website...', icon: Zap },
  ];
  
  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">AI is Working</h2>
        <p className="text-lg text-blue-400 mb-8">{step}</p>
        
        <div className="flex justify-center gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step.includes(s.text.split('...')[0].split(' ').slice(-2).join(' ').toLowerCase());
            return (
              <div 
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-600 scale-110' : 'bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function BrandInputForm({ onComplete }) {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    tone: '',
    audience: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      setLoadingStep('Analyzing your brand identity...');
      await new Promise(r => setTimeout(r, 800));
      
      setLoadingStep('Extracting brand DNA...');
      
      const result = await generateWebsite({
        businessName: formData.businessName,
        description: formData.description,
        tone: formData.tone,
        audience: formData.audience
      });
      
      setLoadingStep('Generating design system...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStep('Creating your website...');
      await new Promise(r => setTimeout(r, 500));
      
      onComplete(result);
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
    { name: '☕ Coffee Shop', desc: 'Cozy neighborhood cafe serving artisan coffee' },
    { name: '💪 Fitness Studio', desc: 'Modern fitness center for health enthusiasts' },
    { name: '🍕 Restaurant', desc: 'Family-friendly restaurant with local cuisine' },
    { name: '💼 Consulting', desc: 'Professional business consulting services' },
  ];

  return (
    <>
      {loading && <LoadingAnimation step={loadingStep} />}
      
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
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> a Stunning Website</span>
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
                  onClick={() => setFormData({
                    ...formData,
                    businessName: template.name.split(' ').slice(1).join(' '),
                    description: template.desc
                  })}
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-sm text-slate-300 transition-all hover:border-slate-600"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Business Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder:text-slate-500 h-32 resize-none"
                  placeholder="Describe your business, what you offer, what makes you unique, and the experience you want customers to have..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 The more detail you provide, the better the AI understands your brand.
                </p>
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
                        className={`px-3 py-1 text-xs bg-${tone.color}-500/10 hover:bg-${tone.color}-500/20 text-${tone.color}-400 border border-${tone.color}-500/20 rounded-full transition`}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.businessName || !formData.description}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
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
                <div className={`w-10 h-10 bg-${feature.color}-500/10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
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
