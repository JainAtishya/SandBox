import { useState, useEffect, useCallback } from 'react'
import { Sliders, Eye, RefreshCw, ChevronRight, Sparkles } from 'lucide-react'
import { generateWebsite } from '../../services/api'

// Custom Slider Component
const BrandSlider = ({ label, leftLabel, rightLabel, value, onChange }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-slate-400">{value}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-r
            [&::-webkit-slider-thumb]:from-blue-500
            [&::-webkit-slider-thumb]:to-purple-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div 
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 pointer-events-none"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">{leftLabel}</span>
        <span className="text-xs text-slate-500">{rightLabel}</span>
      </div>
    </div>
  )
}

// Mini Preview Component
const MiniPreview = ({ data, tuning }) => {
  const { colors, typography, spacing } = data.designTokens || {}
  
  const primaryColor = colors?.primary || '#3B82F6'
  const secondaryColor = colors?.secondary || '#8B5CF6'
  
  // Calculate border radius based on playfulness
  const borderRadius = tuning.playful > 60 ? '16px' : tuning.playful > 40 ? '8px' : '4px'
  
  // Calculate spacing based on bold/subtle
  const paddingScale = tuning.bold > 60 ? 1.3 : tuning.bold > 40 ? 1 : 0.8
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
      {/* Mini Hero */}
      <div 
        className="p-6 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
          padding: `${24 * paddingScale}px`
        }}
      >
        <h3 
          className="text-lg font-bold mb-2"
          style={{ 
            color: primaryColor,
            fontFamily: typography?.fontFamily?.heading || 'Inter'
          }}
        >
          {data.businessName}
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          {data.content?.hero?.subheadline?.slice(0, 60) || 'Experience the difference'}...
        </p>
        <button
          style={{ 
            backgroundColor: primaryColor, 
            borderRadius,
            padding: `${8 * paddingScale}px ${16 * paddingScale}px`
          }}
          className="text-white text-sm font-medium transition-transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
      
      {/* Mini Features */}
      <div className="p-4 bg-slate-50">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-white p-2 text-center"
              style={{ borderRadius }}
            >
              <div 
                className="w-6 h-6 mx-auto mb-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}20` }}
              />
              <div className="h-2 bg-slate-200 rounded w-3/4 mx-auto mb-1" />
              <div className="h-1.5 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Mini CTA */}
      <div 
        className="p-4 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        <p className="text-white text-xs font-medium">Ready to transform your business?</p>
      </div>
    </div>
  )
}

export default function BrandTuningStudio({ data, onProceed }) {
  const [tuning, setTuning] = useState({
    professional: 50,
    playful: 30,
    bold: 60,
    subtle: 40,
    modern: 70,
    classic: 30
  })
  
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [previewData, setPreviewData] = useState(data)
  const [hasChanges, setHasChanges] = useState(false)
  
  const handleSliderChange = (key, value) => {
    setTuning(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }
  
  const handleRegenerate = async () => {
    setIsRegenerating(true)
    
    try {
      // Create adjusted brand input based on tuning
      const adjustedInput = {
        businessName: data.businessName,
        description: data.description,
        tone: getToneFromTuning(tuning),
        audience: data.audience
      }
      
      const result = await generateWebsite(adjustedInput)
      setPreviewData(result)
      setHasChanges(false)
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setIsRegenerating(false)
    }
  }
  
  const getToneFromTuning = (t) => {
    const tones = []
    if (t.professional > 60) tones.push('professional')
    if (t.playful > 60) tones.push('playful', 'friendly')
    if (t.bold > 60) tones.push('bold', 'confident')
    if (t.subtle > 60) tones.push('subtle', 'elegant')
    if (t.modern > 60) tones.push('modern', 'innovative')
    if (t.classic > 60) tones.push('classic', 'traditional')
    return tones.length > 0 ? tones.join(', ') : 'professional, balanced'
  }
  
  const handleProceed = () => {
    // Pass tuned data to next step
    const tunedData = {
      ...previewData,
      tuning
    }
    onProceed(tunedData)
  }
  
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm mb-4">
            <Sliders className="w-4 h-4" />
            <span>Brand Tuning Studio</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Fine-Tune Your Brand Expression
          </h1>
          <p className="text-slate-400">
            Adjust the sliders and watch your website transform in real-time
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders Panel */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              Brand Dimensions
            </h3>
            
            <BrandSlider
              label="Tone"
              leftLabel="Professional"
              rightLabel="Playful"
              value={tuning.playful}
              onChange={(v) => {
                handleSliderChange('playful', v)
                handleSliderChange('professional', 100 - v)
              }}
            />
            
            <BrandSlider
              label="Expression"
              leftLabel="Bold"
              rightLabel="Subtle"
              value={tuning.subtle}
              onChange={(v) => {
                handleSliderChange('subtle', v)
                handleSliderChange('bold', 100 - v)
              }}
            />
            
            <BrandSlider
              label="Style"
              leftLabel="Modern"
              rightLabel="Classic"
              value={tuning.classic}
              onChange={(v) => {
                handleSliderChange('classic', v)
                handleSliderChange('modern', 100 - v)
              }}
            />
            
            {/* Regenerate Button */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || !hasChanges}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  hasChanges 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Apply Changes with AI
                  </>
                )}
              </button>
              {hasChanges && !isRegenerating && (
                <p className="text-xs text-amber-400 text-center mt-2">
                  You have unsaved changes. Click to regenerate with new settings.
                </p>
              )}
            </div>
            
            {/* Current Settings */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-3">Current Brand Profile</h4>
              <div className="flex flex-wrap gap-2">
                {tuning.professional > 50 && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Professional</span>
                )}
                {tuning.playful > 50 && (
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-full">Playful</span>
                )}
                {tuning.bold > 50 && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Bold</span>
                )}
                {tuning.subtle > 50 && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Subtle</span>
                )}
                {tuning.modern > 50 && (
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Modern</span>
                )}
                {tuning.classic > 50 && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Classic</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Live Preview
            </h3>
            
            <div className="relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-slate-300">AI is regenerating your design...</p>
                  </div>
                </div>
              )}
              
              <MiniPreview data={previewData} tuning={tuning} />
              
              <p className="text-xs text-slate-500 text-center mt-4">
                This is a simplified preview. Full website will be generated next.
              </p>
            </div>
            
            {/* Design Token Preview */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-3">Active Design Tokens</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500">Primary</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded-md"
                      style={{ backgroundColor: previewData.designTokens?.colors?.primary || '#3B82F6' }}
                    />
                    <span className="text-xs text-slate-300 font-mono">
                      {previewData.designTokens?.colors?.primary || '#3B82F6'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Secondary</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded-md"
                      style={{ backgroundColor: previewData.designTokens?.colors?.secondary || '#8B5CF6' }}
                    />
                    <span className="text-xs text-slate-300 font-mono">
                      {previewData.designTokens?.colors?.secondary || '#8B5CF6'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Font</span>
                  <p className="text-sm text-slate-300 mt-1" style={{ fontFamily: previewData.designTokens?.typography?.fontFamily?.heading }}>
                    {previewData.designTokens?.typography?.fontFamily?.heading || 'Inter'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Border Radius</span>
                  <p className="text-sm text-slate-300 mt-1">
                    {previewData.designTokens?.borderRadius?.medium || '8px'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="text-center mt-10">
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Generate Design Variations
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-3">
            We'll create 3 unique interpretations of your brand
          </p>
        </div>
      </div>
    </div>
  )
}
