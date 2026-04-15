import { useState } from 'react'
import { Sliders, Eye, ChevronRight, GripVertical, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react'

const SECTION_LIBRARY = [
  { key: 'hero-main', type: 'hero', label: 'Hero', description: 'Main opening section', maxCount: 1 },
  { key: 'features-services', type: 'features', label: 'Services', description: 'What you offer', maxCount: 1 },
  { key: 'features-benefits', type: 'features', label: 'Benefits', description: 'Why customers choose you', maxCount: 1 },
  { key: 'features-about', type: 'features', label: 'About Us', description: 'Brand story and values', maxCount: 1 },
  { key: 'features-faq', type: 'features', label: 'FAQ', description: 'Common customer questions', maxCount: 1 },
  { key: 'testimonials-main', type: 'testimonials', label: 'Testimonials', description: 'Social proof', maxCount: 1 },
  { key: 'testimonials-case', type: 'testimonials', label: 'Success Stories', description: 'Results and wins', maxCount: 1 },
  { key: 'cta-main', type: 'cta', label: 'Call To Action', description: 'Conversion section', maxCount: 1 },
  { key: 'footer-main', type: 'footer', label: 'Footer', description: 'Contact and links', maxCount: 1 }
]

// Mini Preview Component
const MiniPreview = ({ data }) => {
  const { colors, typography } = data.designTokens || {}
  
  const primaryColor = colors?.primary || '#3B82F6'
  const secondaryColor = colors?.secondary || '#8B5CF6'
  
  const borderRadius = data.designTokens?.borderRadius?.medium || '8px'
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
      {/* Mini Hero */}
      <div 
        className="p-6 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
          padding: '24px'
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
            padding: '8px 16px'
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
  const defaultSections = getDefaultSections(data)
  const [previewData, setPreviewData] = useState({
    ...data,
    sections: defaultSections,
    content: syncContentFromSections(defaultSections, data.content || {})
  })
  const [sections, setSections] = useState(defaultSections)
  const [activeSection, setActiveSection] = useState(defaultSections[0]?.id || 'hero')
  const [showSectionSuggestions, setShowSectionSuggestions] = useState(false)
  
  const handleProceed = () => {
    // Pass tuned data to next step
    const tunedData = {
      ...previewData,
      sections,
      content: syncContentFromSections(sections, previewData.content || {})
    }
    onProceed(tunedData)
  }

  const updateSections = (nextSections) => {
    setSections(nextSections)
    setPreviewData((prev) => ({
      ...prev,
      sections: nextSections,
      content: syncContentFromSections(nextSections, prev.content || {})
    }))
  }

  const moveSection = (sectionId, direction) => {
    const index = sections.findIndex((s) => s.id === sectionId)
    if (index === -1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= sections.length) return
    const next = [...sections]
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
    updateSections(next)
  }

  const removeSection = (sectionId) => {
    const next = sections.filter((s) => s.id !== sectionId)
    updateSections(next)
    if (activeSection === sectionId) {
      setActiveSection(next[0]?.id || '')
    }
  }

  const addSection = (template) => {
    if (!canAddTemplate(template, sections)) return
    const newSection = createSectionFromTemplate(template, data, sections)
    const next = [...sections, newSection]
    updateSections(next)
    setActiveSection(newSection.id)
    setShowSectionSuggestions(false)
  }

  const updateSectionContent = (sectionId, updater) => {
    const next = sections.map((section) => {
      if (section.id !== sectionId) return section
      return {
        ...section,
        content: typeof updater === 'function' ? updater(section.content || {}) : updater
      }
    })
    updateSections(next)
  }

  const activeSectionData = sections.find((s) => s.id === activeSection)
  
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm mb-4">
            <Sliders className="w-4 h-4" />
            <span>Brand Content Studio</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Content & Components
          </h1>
          <p className="text-slate-400">
            Arrange sections and refine your messaging before visual style variations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Components Panel */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-blue-400" />
              Components & Order
            </h3>

            <div className="space-y-3 mb-5">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`rounded-xl border px-4 py-3 transition ${
                    activeSection === section.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className="text-left flex-1"
                    >
                      <p className="text-sm font-semibold text-white">{section.label || section.type}</p>
                      <p className="text-xs text-slate-400">Edit content and arrangement</p>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg bg-slate-700/60 text-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-2 rounded-lg bg-slate-700/60 text-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="p-2 rounded-lg bg-rose-500/20 text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setShowSectionSuggestions((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
              >
                <Plus className="w-4 h-4" />
                Add section suggestions
              </button>

              {showSectionSuggestions && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {SECTION_LIBRARY.map((template) => {
                    const disabled = !canAddTemplate(template, sections)
                    return (
                      <button
                        key={template.key}
                        type="button"
                        disabled={disabled}
                        onClick={() => addSection(template)}
                        className={`text-left px-3 py-2 rounded-lg border transition ${
                          disabled
                            ? 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed'
                            : 'border-slate-700 bg-slate-800/40 text-slate-200 hover:border-blue-500/50'
                        }`}
                      >
                        <p className="text-sm font-medium">{template.label}</p>
                        <p className="text-xs text-slate-400">{template.description}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Editor</h3>
            {!activeSectionData && <p className="text-slate-400 text-sm">Select a section to edit.</p>}

            {activeSectionData?.type === 'hero' && (
              <div className="space-y-3">
                <LabeledInput
                  label="Headline"
                  value={activeSectionData.content?.headline || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, headline: v }))}
                />
                <LabeledTextarea
                  label="Subheadline"
                  value={activeSectionData.content?.subheadline || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, subheadline: v }))}
                />
                <LabeledInput
                  label="Primary CTA Text"
                  value={activeSectionData.content?.cta?.text || ''}
                  onChange={(v) =>
                    updateSectionContent(activeSectionData.id, (content) => ({
                      ...content,
                      cta: { ...(content.cta || {}), text: v }
                    }))
                  }
                />
              </div>
            )}

            {activeSectionData?.type === 'features' && (
              <div className="space-y-3">
                <LabeledInput
                  label="Section Title"
                  value={activeSectionData.content?.title || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, title: v }))}
                />
                <LabeledTextarea
                  label="Features (one per line: Title | Description)"
                  value={formatFeaturesTextarea(activeSectionData.content)}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({
                    ...content,
                    items: parseFeaturesTextarea(v),
                    features: parseFeaturesTextarea(v)
                  }))}
                />
              </div>
            )}

            {activeSectionData?.type === 'testimonials' && (
              <div className="space-y-3">
                <LabeledInput
                  label="Section Title"
                  value={activeSectionData.content?.title || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, title: v }))}
                />
                <LabeledTextarea
                  label="Testimonials (one per line: Quote | Author | Role)"
                  value={formatTestimonialsTextarea(activeSectionData.content)}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({
                    ...content,
                    testimonials: parseTestimonialsTextarea(v)
                  }))}
                />
              </div>
            )}

            {activeSectionData?.type === 'cta' && (
              <div className="space-y-3">
                <LabeledInput
                  label="Headline"
                  value={activeSectionData.content?.headline || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, headline: v }))}
                />
                <LabeledTextarea
                  label="Supporting text"
                  value={activeSectionData.content?.supportingText || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, supportingText: v }))}
                />
                <LabeledInput
                  label="CTA text"
                  value={activeSectionData.content?.cta?.text || ''}
                  onChange={(v) =>
                    updateSectionContent(activeSectionData.id, (content) => ({
                      ...content,
                      cta: { ...(content.cta || {}), text: v }
                    }))
                  }
                />
              </div>
            )}

            {activeSectionData?.type === 'footer' && (
              <div className="space-y-3">
                <LabeledTextarea
                  label="Footer description"
                  value={activeSectionData.content?.description || ''}
                  onChange={(v) => updateSectionContent(activeSectionData.id, (content) => ({ ...content, description: v }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="mt-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            Content Preview
          </h3>
          <MiniPreview data={previewData} />
          <p className="text-xs text-slate-500 text-center mt-4">
            This keeps content structure ready. Visual style options come in the next step.
          </p>
        </div>
        
        {/* Continue Button */}
        <div className="text-center mt-10">
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Continue to Design Variations
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-3">
            Next, choose one of 3 visual styles for this tuned content
          </p>
        </div>
      </div>
    </div>
  )
}

function LabeledInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm"
      />
    </label>
  )
}

function LabeledTextarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm resize-y"
      />
    </label>
  )
}

function getDefaultSections(data) {
  if (data?.sections?.length) return data.sections
  return ['hero', 'features', 'testimonials', 'cta', 'footer'].map((type) =>
    createSectionTemplate(type, data, { label: toTitleCase(type), templateKey: `${type}-default` })
  )
}

function createSectionTemplate(type, data, metadata = {}) {
  const content = data?.content || {}
  const baseDescription = data?.description || `Welcome to ${data?.businessName || 'our business'}`
  const defaults = {
    hero: {
      headline: content.hero?.headline || `Welcome to ${data?.businessName || 'Our Business'}`,
      subheadline: content.hero?.subheadline || baseDescription,
      cta: content.hero?.cta || { text: 'Get Started', link: '#contact' }
    },
    features: {
      title: content.features?.title || `Why Choose ${data?.businessName || 'Us'}`,
      items: content.features?.items || content.features?.features || [
        { icon: 'star', title: 'Quality', description: 'Consistent quality you can trust.' },
        { icon: 'users', title: 'Customer Focus', description: 'Built around your needs.' },
        { icon: 'zap', title: 'Fast Service', description: 'Quick and reliable delivery.' }
      ]
    },
    testimonials: {
      title: content.testimonials?.title || 'What Our Customers Say',
      testimonials: content.testimonials?.testimonials || [
        { quote: 'Great experience and service!', author: 'Happy Customer', role: 'Client' },
        { quote: 'Professional and reliable team.', author: 'Business Owner', role: 'Partner' }
      ]
    },
    cta: {
      headline: content.cta?.headline || 'Ready to Get Started?',
      supportingText: content.cta?.supportingText || 'Let us help your business grow today.',
      cta: content.cta?.cta || { text: 'Contact Us', link: '#contact' }
    },
    footer: {
      description: content.footer?.description || content.hero?.subheadline || baseDescription
    }
  }

  return {
    id: `${type}-1`,
    type,
    label: metadata.label || toTitleCase(type),
    templateKey: metadata.templateKey || `${type}-default`,
    variant: type === 'features' || type === 'testimonials' ? 'grid' : 'centered',
    content: defaults[type]
  }
}

function createSectionFromTemplate(template, data, existingSections) {
  const sameTypeCount = existingSections.filter((section) => section.type === template.type).length
  const section = createSectionTemplate(template.type, data, {
    label: template.label,
    templateKey: template.key
  })
  return {
    ...section,
    id: `${template.type}-${sameTypeCount + 1}`
  }
}

function canAddTemplate(template, existingSections) {
  const singleInstanceTypes = ['hero', 'cta', 'footer']
  if (singleInstanceTypes.includes(template.type)) {
    const existingByType = existingSections.filter((section) => section.type === template.type).length
    if (existingByType >= 1) return false
  }

  const existingForTemplate = existingSections.filter((section) => section.templateKey === template.key).length
  return existingForTemplate < (template.maxCount || 1)
}

function toTitleCase(value) {
  const upperMap = {
    cta: 'CTA',
    faq: 'FAQ'
  }
  return upperMap[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1)
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

function formatFeaturesTextarea(content) {
  const items = content?.items || content?.features || []
  return items.map((item) => `${item.title || ''} | ${item.description || ''}`).join('\n')
}

function parseFeaturesTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, description] = line.split('|').map((part) => (part || '').trim())
      return {
        icon: ['star', 'users', 'zap', 'target'][index % 4],
        title: title || `Feature ${index + 1}`,
        description: description || 'Feature description'
      }
    })
}

function formatTestimonialsTextarea(content) {
  const items = content?.testimonials || []
  return items
    .map((item) => `${item.quote || ''} | ${item.author || ''} | ${item.role || ''}`)
    .join('\n')
}

function parseTestimonialsTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [quote, author, role] = line.split('|').map((part) => (part || '').trim())
      return {
        quote: quote || 'Great service!',
        author: author || `Customer ${index + 1}`,
        role: role || 'Customer'
      }
    })
}
