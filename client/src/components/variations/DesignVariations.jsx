import { useState, useEffect } from 'react'
import { Layout, Check, Sparkles, ChevronRight, Zap, Heart, Crown } from 'lucide-react'
import { generateWebsite } from '../../services/api'

// Variation Card Component
const VariationCard = ({ variation, isSelected, onSelect, isLoading }) => {
  const { name, description, icon: Icon, data } = variation
  const colors = data?.designTokens?.colors || {}
  const typography = data?.designTokens?.typography || {}
  const cardThemeClass = variation.id === 'premium'
    ? 'variation-premium'
    : variation.id === 'approachable'
      ? 'variation-approachable'
      : 'variation-confident'
  
  return (
    <div
      onClick={() => !isLoading && onSelect()}
      className={`relative bg-slate-900/50 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden variation-card ${cardThemeClass} ${
        isSelected 
          ? 'border-blue-500 ring-4 ring-blue-500/20' 
          : 'border-slate-700 hover:border-slate-600'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {/* Selection Badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}
      
      {/* Variation Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary || '#3B82F6'}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.primary || '#3B82F6' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
      </div>
      
      {/* Mini Website Preview */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse mx-auto mb-2" />
            <p className="text-sm text-slate-400">Generating variation...</p>
          </div>
        </div>
      ) : data ? (
        <div className="bg-white">
          {/* Hero Section Preview */}
          <div 
            className={`p-6 text-center relative overflow-hidden`}
            style={{ 
              background: variation.id === 'premium'
                ? 'linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #111827 100%)'
                : `linear-gradient(135deg, ${colors.primary}12, ${colors.secondary || colors.primary}08)`
            }}
          >
            {variation.id === 'premium' && (
              <div className="absolute inset-0 premium-shimmer" />
            )}
            <h4 
              className="text-xl font-bold mb-2"
              style={{ 
                color: variation.id === 'premium' ? '#F8FAFC' : colors.primary,
                fontFamily: typography.fontFamily?.heading || 'Inter'
              }}
            >
              {data.content?.hero?.headline || data.businessName}
            </h4>
            <p className={`text-sm mb-4 line-clamp-2 ${variation.id === 'premium' ? 'text-slate-200' : 'text-slate-600'}`}>
              {data.content?.hero?.subheadline || 'Your brand message here'}
            </p>
            <button
              className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-transform hover:scale-105 ${variation.id === 'premium' ? 'premium-glow-btn' : ''}`}
              style={{ backgroundColor: variation.id === 'premium' ? '#C9A45C' : colors.primary }}
            >
              {data.content?.hero?.cta?.text || 'Get Started'}
            </button>
          </div>
          
          {/* Features Preview */}
          <div className="p-4 bg-slate-50">
            <div className="grid grid-cols-3 gap-2">
              {(data.content?.features?.items || [1, 2, 3]).slice(0, 3).map((feature, i) => (
                <div key={i} className="bg-white p-3 rounded-lg text-center">
                  <div 
                    className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.primary }} />
                  </div>
                  <div className="text-xs font-medium text-slate-700 line-clamp-1">
                    {typeof feature === 'object' ? feature.title : `Feature ${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Preview */}
          <div 
            className="p-4 text-center"
            style={{ backgroundColor: colors.primary }}
          >
            <p className="text-white text-sm font-medium">Ready to get started?</p>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-500">Preview unavailable</p>
        </div>
      )}
      
      {/* Color Palette Preview */}
      {data && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-500">Color Palette</span>
          </div>
          <div className="flex gap-1">
            <div 
              className="flex-1 h-6 rounded-l-lg"
              style={{ backgroundColor: colors.primary || '#3B82F6' }}
            />
            <div 
              className="flex-1 h-6"
              style={{ backgroundColor: colors.secondary || '#8B5CF6' }}
            />
            <div 
              className="flex-1 h-6"
              style={{ backgroundColor: colors.accent || '#10B981' }}
            />
            <div 
              className="flex-1 h-6 rounded-r-lg"
              style={{ backgroundColor: colors.neutral?.['100'] || '#F1F5F9' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">
              Font: {typography.fontFamily?.heading || 'Inter'}
            </span>
            <span className="text-xs text-slate-500">
              {data.designTokens?.layout?.style || 'Centered'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DesignVariations({ data, onSelect }) {
  const [variations, setVariations] = useState([
    { 
      id: 'confident', 
      name: 'Confident', 
      description: 'Bold and assertive, makes a strong first impression',
      icon: Zap,
      tone: 'bold, confident, professional',
      data: null
    },
    { 
      id: 'approachable', 
      name: 'Approachable', 
      description: 'Warm and friendly, builds instant trust',
      icon: Heart,
      tone: 'friendly, warm, approachable',
      data: null
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      description: 'Elegant and sophisticated, conveys quality',
      icon: Crown,
      tone: 'elegant, sophisticated, premium',
      data: null
    }
  ])
  
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  
  useEffect(() => {
    generateAllVariations()
  }, [])
  
  const generateAllVariations = async () => {
    setIsLoading(true)
    
    // Generate variations sequentially to avoid rate limiting
    const updatedVariations = []
    
    for (const variation of variations) {
      setLoadingId(variation.id)
      try {
        const result = await generateWebsite({
          businessName: data.businessName,
          description: data.description,
          tone: variation.tone,
          audience: data.audience
        })
        const mergedResult = data.sections?.length
          ? {
              ...result,
              sections: data.sections,
              content: syncContentFromSections(data.sections, result.content || data.content || {})
            }
          : result
        updatedVariations.push({ ...variation, data: mergedResult })
      } catch (error) {
        console.error(`Failed to generate ${variation.name}:`, error)
        // Use the original data as fallback with some modifications
        updatedVariations.push({ 
          ...variation, 
          data: {
            ...data,
            designTokens: modifyTokensForVariation(data.designTokens, variation.id)
          }
        })
      }
      
      // Update state after each variation
      setVariations([...updatedVariations, ...variations.slice(updatedVariations.length)])
    }
    
    setVariations(updatedVariations)
    // Auto-select the first variation
    setSelectedId(updatedVariations[0].id)
    setIsLoading(false)
    setLoadingId(null)
  }
  
  const modifyTokensForVariation = (tokens, variationId) => {
    // Create slightly different tokens for each variation as fallback
    const baseTokens = tokens || {}
    const colorAdjustments = {
      confident: { primary: '#1E40AF', secondary: '#7C3AED', accent: '#DC2626' },
      approachable: { primary: '#0F766E', secondary: '#0EA5E9', accent: '#F59E0B' },
      premium: { primary: '#2B1B3B', secondary: '#C9A45C', accent: '#F4B400' }
    }
    const typographyAdjustments = {
      confident: { heading: 'Montserrat', body: 'Roboto' },
      approachable: { heading: 'Inter', body: 'Open Sans' },
      premium: { heading: 'Playfair Display', body: 'Lora' }
    }
    
    return {
      ...baseTokens,
      colors: {
        ...baseTokens.colors,
        ...colorAdjustments[variationId]
      },
      typography: {
        ...baseTokens.typography,
        fontFamily: {
          ...(baseTokens.typography?.fontFamily || {}),
          ...(typographyAdjustments[variationId] || {})
        }
      }
    }
  }
  
  const handleSelect = (id) => {
    setSelectedId(id)
  }
  
  const handleProceed = () => {
    const selected = variations.find(v => v.id === selectedId)
    if (selected?.data) {
      onSelect({
        ...selected.data,
        variationName: selected.name,
        variationDescription: selected.description
      })
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm mb-4">
            <Layout className="w-4 h-4" />
            <span>Design Variations</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Your Brand Expression
          </h1>
          <p className="text-slate-400">
            We've created 3 unique interpretations of your brand. Select your favorite.
          </p>
        </div>
        
        {/* Variations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {variations.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              isSelected={selectedId === variation.id}
              onSelect={() => handleSelect(variation.id)}
              isLoading={loadingId === variation.id}
            />
          ))}
        </div>
        
        {/* Selection Info */}
        {selectedId && !isLoading && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Selected: {variations.find(v => v.id === selectedId)?.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {variations.find(v => v.id === selectedId)?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Tip:</span>
                <span className="text-xs text-slate-400">
                  You can always fine-tune after previewing
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleProceed}
            disabled={!selectedId || isLoading}
            className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all shadow-lg ${
              selectedId && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25 hover:shadow-blue-500/40'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Generating Variations...
              </>
            ) : (
              <>
                View Full Website
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-sm text-slate-500 mt-3">
            Preview the complete website with all sections
          </p>
        </div>
      </div>
    </div>
  )
}

function syncContentFromSections(sections, existingContent) {
  const nextContent = { ...(existingContent || {}) }
  sections.forEach((section) => {
    if (section.type && section.content) {
      nextContent[section.type] = section.content
    }
  })
  return nextContent
}
