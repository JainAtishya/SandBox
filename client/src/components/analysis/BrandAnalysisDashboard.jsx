import { useState, useEffect } from 'react'
import { Brain, Palette, Users, Target, Lightbulb, ChevronRight, Sparkles } from 'lucide-react'

// Custom Radar Chart Component (no external dependency)
const RadarChart = ({ data, size = 200 }) => {
  const centerX = size / 2
  const centerY = size / 2
  const radius = size * 0.35
  const levels = 5
  
  // Calculate points for each axis
  const angleStep = (2 * Math.PI) / data.length
  
  const getPoint = (value, index) => {
    const angle = index * angleStep - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    }
  }
  
  const dataPoints = data.map((d, i) => getPoint(d.value, i))
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Background circles */}
      {[...Array(levels)].map((_, i) => (
        <polygon
          key={i}
          points={data.map((_, j) => {
            const angle = j * angleStep - Math.PI / 2
            const r = ((i + 1) / levels) * radius
            return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`
          }).join(' ')}
          fill="none"
          stroke="rgba(100, 116, 139, 0.2)"
          strokeWidth="1"
        />
      ))}
      
      {/* Axis lines */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={centerX + radius * Math.cos(angle)}
            y2={centerY + radius * Math.sin(angle)}
            stroke="rgba(100, 116, 139, 0.3)"
            strokeWidth="1"
          />
        )
      })}
      
      {/* Data polygon */}
      <path
        d={pathD}
        fill="rgba(59, 130, 246, 0.3)"
        stroke="rgb(59, 130, 246)"
        strokeWidth="2"
      />
      
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="rgb(59, 130, 246)"
          className="drop-shadow-md"
        />
      ))}
      
      {/* Labels */}
      {data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = radius + 25
        const x = centerX + labelRadius * Math.cos(angle)
        const y = centerY + labelRadius * Math.sin(angle)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-slate-400 font-medium"
          >
            {d.name}
          </text>
        )
      })}
    </svg>
  )
}

// Emotion Wheel Component
const EmotionWheel = ({ emotions }) => {
  const colors = {
    trust: '#3B82F6',
    joy: '#F59E0B',
    calm: '#10B981',
    excitement: '#EF4444',
    sophistication: '#8B5CF6',
    warmth: '#F97316',
    confidence: '#6366F1',
    innovation: '#06B6D4'
  }
  
  return (
    <div className="relative w-48 h-48">
      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <span className="text-xs text-slate-400">Core</span>
        </div>
      </div>
      
      {/* Emotion segments */}
      {emotions.map((emotion, index) => {
        const angle = (index / emotions.length) * 360
        const radians = (angle - 90) * (Math.PI / 180)
        const x = 96 + Math.cos(radians) * 65
        const y = 96 + Math.sin(radians) * 65
        
        return (
          <div
            key={emotion.name}
            className="absolute flex flex-col items-center"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              style={{ 
                backgroundColor: colors[emotion.name.toLowerCase()] || '#6B7280',
                boxShadow: `0 0 20px ${colors[emotion.name.toLowerCase()] || '#6B7280'}40`
              }}
            >
              {emotion.value}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">{emotion.name}</span>
          </div>
        )
      })}
    </div>
  )
}

// AI Reasoning Card Component
const AIReasoningCard = ({ title, explanation, icon: Icon, color }) => {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 cursor-pointer transition-all hover:border-slate-600 ${expanded ? 'ring-2 ring-blue-500/30' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
          <p className={`text-xs text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {explanation}
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
    </div>
  )
}

// Audience Persona Card
const PersonaCard = ({ persona }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
          {persona.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{persona.name}</h4>
          <p className="text-xs text-slate-400">{persona.role}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Age:</span>
          <span className="text-slate-300">{persona.age}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {persona.values.map((value, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function BrandAnalysisDashboard({ data, onProceed }) {
  const [animationPhase, setAnimationPhase] = useState(0)
  
  useEffect(() => {
    // Staggered animation phases
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 800),
      setTimeout(() => setAnimationPhase(3), 1300),
      setTimeout(() => setAnimationPhase(4), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])
  
  const brandDNA = data.brandDNA || {}
  const designReasoning = data.designReasoning || {}
  
  // Personality data for radar chart
  const personalityData = [
    { name: 'Professional', value: brandDNA.personality?.professional || 70 },
    { name: 'Friendly', value: brandDNA.personality?.friendly || 60 },
    { name: 'Bold', value: brandDNA.personality?.bold || 50 },
    { name: 'Elegant', value: brandDNA.personality?.elegant || 40 },
    { name: 'Innovative', value: brandDNA.personality?.innovative || 80 },
  ]
  
  // Emotion data (prefer explicit emotion labels, fallback to score map)
  const emotionData = buildEmotionData(brandDNA)
  
  // Audience personas
  const personas = Array.isArray(brandDNA.audiencePersonas) && brandDNA.audiencePersonas.length
    ? brandDNA.audiencePersonas
    : [
    { name: 'Sarah', role: 'Marketing Manager', age: '28-35', values: ['Quality', 'Speed', 'Design'] },
    { name: 'Michael', role: 'Small Business Owner', age: '35-45', values: ['Value', 'Reliability', 'Trust'] },
  ]
  
  // AI Reasoning points
  const reasoningPoints = [
    {
      title: `Color Choice: ${data.designTokens?.colors?.primary || '#3B82F6'}`,
      explanation: designReasoning.color || `I chose this color because it evokes ${brandDNA.tone?.[0] || 'trust'} and ${brandDNA.emotion?.[0] || 'professionalism'}. This shade is psychologically linked to ${brandDNA.industry || 'your industry'}'s most successful brands while maintaining your unique identity.`,
      icon: Palette,
      color: data.designTokens?.colors?.primary || '#3B82F6'
    },
    {
      title: `Typography: ${data.designTokens?.typography?.fontFamily?.heading || 'Inter'}`,
      explanation: designReasoning.typography || `Your ${brandDNA.visualStyle?.[0] || 'modern'} visual style pairs perfectly with this geometric sans-serif. It offers excellent readability for ${brandDNA.audience?.primary || 'your target audience'} while conveying ${brandDNA.tone?.[0] || 'professionalism'}.`,
      icon: Target,
      color: '#8B5CF6'
    },
    {
      title: `Layout Style: ${data.designTokens?.layout?.style || 'Centered'}`,
      explanation: designReasoning.layout || `Based on your ${brandDNA.tone?.[0] || 'professional'} tone and ${brandDNA.industry || 'industry'}, a ${data.designTokens?.layout?.style || 'centered'} layout creates the trust and credibility your audience expects. This structure guides the eye naturally through your value proposition.`,
      icon: Lightbulb,
      color: '#10B981'
    },
  ]
  
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm mb-4">
            <Brain className="w-4 h-4" />
            <span>AI Analysis Complete</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Brand Intelligence Report
          </h1>
          <p className="text-slate-400">
            for <span className="text-white font-semibold">{data.businessName}</span>
          </p>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Personality Radar */}
          <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-6 transition-all duration-700 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Brand Personality
            </h3>
            <div className="flex justify-center">
              <RadarChart data={personalityData} size={220} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {brandDNA.tone?.slice(0, 4).map((tone, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800/50 rounded-lg text-xs text-slate-300 text-center">
                  {tone}
                </div>
              ))}
            </div>
          </div>
          
          {/* Emotion Wheel */}
          <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-6 transition-all duration-700 delay-100 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Emotional Resonance
            </h3>
            <div className="flex justify-center py-4">
              <EmotionWheel emotions={emotionData} />
            </div>
            <p className="text-xs text-slate-500 text-center mt-4">
              AI-detected emotional triggers for your target audience
            </p>
          </div>
          
          {/* Audience Personas */}
          <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-6 transition-all duration-700 delay-200 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Target Personas
            </h3>
            <div className="space-y-4">
              {personas.map((persona, i) => (
                <PersonaCard key={i} persona={persona} />
              ))}
            </div>
          </div>
        </div>
        
        {/* AI Reasoning Section */}
        <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-8 transition-all duration-700 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            AI Design Reasoning
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Here's why I made these design decisions for your brand
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reasoningPoints.map((point, i) => (
              <AIReasoningCard key={i} {...point} />
            ))}
          </div>
        </div>
        
        {/* Design Tokens Preview */}
        <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-8 transition-all duration-700 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h3 className="text-lg font-semibold text-white mb-4">Generated Design System</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Color Palette */}
            <div>
              <span className="text-xs text-slate-500 block mb-2">Primary Colors</span>
              <div className="flex gap-1">
                <div 
                  className="w-10 h-10 rounded-lg shadow-lg" 
                  style={{ backgroundColor: data.designTokens?.colors?.primary || '#3B82F6' }}
                />
                <div 
                  className="w-10 h-10 rounded-lg shadow-lg" 
                  style={{ backgroundColor: data.designTokens?.colors?.secondary || '#8B5CF6' }}
                />
                <div 
                  className="w-10 h-10 rounded-lg shadow-lg" 
                  style={{ backgroundColor: data.designTokens?.colors?.accent || '#10B981' }}
                />
              </div>
            </div>
            
            {/* Typography */}
            <div>
              <span className="text-xs text-slate-500 block mb-2">Typography</span>
              <div className="text-white">
                <p className="text-lg font-bold" style={{ fontFamily: data.designTokens?.typography?.fontFamily?.heading || 'Inter' }}>
                  {data.designTokens?.typography?.fontFamily?.heading || 'Inter'}
                </p>
                <p className="text-sm text-slate-400">Heading Font</p>
              </div>
            </div>
            
            {/* Spacing */}
            <div>
              <span className="text-xs text-slate-500 block mb-2">Spacing Scale</span>
              <div className="flex items-end gap-1">
                {[8, 16, 24, 32].map((size, i) => (
                  <div 
                    key={i}
                    className="bg-blue-500/30 rounded"
                    style={{ width: '16px', height: `${size}px` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">{data.designTokens?.spacing?.scale || '1.25'} scale</p>
            </div>
            
            {/* Border Radius */}
            <div>
              <span className="text-xs text-slate-500 block mb-2">Border Radius</span>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-slate-700 rounded-sm" />
                <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                <div className="w-8 h-8 bg-slate-700 rounded-full" />
              </div>
              <p className="text-xs text-slate-400 mt-1">{brandDNA.visualStyle?.[0] || 'Modern'} style</p>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className={`text-center transition-all duration-700 ${animationPhase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onProceed}
            className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Continue to Design Variations
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-3">
            Choose your preferred visual style based on these recommendations
          </p>
        </div>
      </div>
    </div>
  )
}

function buildEmotionData(brandDNA) {
  const explicitEmotionLabels = Array.isArray(brandDNA?.emotion) ? brandDNA.emotion : []
  const emotionScores = brandDNA?.emotions && typeof brandDNA.emotions === 'object' ? brandDNA.emotions : {}

  const labelToScoreKey = {
    trustworthy: 'trust',
    reliable: 'confidence',
    calm: 'calm',
    exciting: 'joy',
    inspiring: 'confidence',
    luxurious: 'confidence',
    accessible: 'calm',
    energetic: 'joy',
    sophisticated: 'confidence',
    creative: 'joy',
    comforting: 'calm',
    empowering: 'confidence'
  }

  const fromLabels = explicitEmotionLabels
    .slice(0, 4)
    .map((label, index) => {
      const normalized = String(label || '').toLowerCase()
      const mappedKey = labelToScoreKey[normalized]
      const base = mappedKey && Number.isFinite(Number(emotionScores[mappedKey]))
        ? Number(emotionScores[mappedKey])
        : 62 + index * 7
      return {
        name: toTitleCase(label),
        value: Math.max(45, Math.min(95, Math.round(base)))
      }
    })

  if (fromLabels.length > 0) return fromLabels

  return [
    { name: 'Trust', value: Number(emotionScores.trust) || 85 },
    { name: 'Calm', value: Number(emotionScores.calm) || 72 },
    { name: 'Joy', value: Number(emotionScores.joy) || 68 },
    { name: 'Confidence', value: Number(emotionScores.confidence) || 75 }
  ]
}

function toTitleCase(text) {
  return String(text || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}
