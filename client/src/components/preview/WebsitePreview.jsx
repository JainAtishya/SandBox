import { useEffect, useState } from 'react';
import Hero from '../core/Hero';
import Features from '../core/Features';
import Testimonials from '../core/Testimonials';
import CTA from '../core/CTA';
import Footer from '../core/Footer';
import Contact from '../core/Contact';
import Gallery from '../core/Gallery';
import Menu from '../core/Menu';
import { Download, RefreshCw, Eye, Code, Palette, Edit3, Monitor, Tablet, Smartphone, CheckCircle, Zap, Box, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

const FONT_OPTIONS = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lora', 'Merriweather'];
const AVAILABLE_SECTION_TYPES = [
  { type: 'hero', label: 'Hero' },
  { type: 'features', label: 'Features' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'cta', label: 'CTA' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'menu', label: 'Menu & Pricing' },
  { type: 'contact', label: 'Contact Us' },
  { type: 'footer', label: 'Footer' }
];
const DEFAULT_WEBSITE_DATA = {
  businessName: 'Business Name',
  brandDNA: {},
  designTokens: {
    colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981', neutral: { 50: '#F8FAFC' } },
    typography: { fontFamily: { heading: 'Inter', body: 'Inter' } },
    spacing: { section: '96px', component: '64px', element: '16px' },
    borderRadius: { small: '8px', medium: '12px', large: '16px' }
  },
  sections: [],
  content: {}
};

export default function WebsitePreview({ data, onRegenerate }) {
  const [websiteData, setWebsiteData] = useState(() => sanitizeWebsiteData(data));
  const [activeTab, setActiveTab] = useState('preview');
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [activeSectionId, setActiveSectionId] = useState('');
  const [removedSections, setRemovedSections] = useState([]);
  const [tokenDraft, setTokenDraft] = useState({
    primary: data?.designTokens?.colors?.primary || '#3B82F6',
    secondary: data?.designTokens?.colors?.secondary || '#8B5CF6',
    accent: data?.designTokens?.colors?.accent || '#10B981',
    headingFont: data?.designTokens?.typography?.fontFamily?.heading || 'Inter',
    bodyFont: data?.designTokens?.typography?.fontFamily?.body || 'Inter'
  });

  useEffect(() => {
    setWebsiteData(sanitizeWebsiteData(data));
  }, [data]);

  useEffect(() => {
    setTokenDraft({
      primary: websiteData?.designTokens?.colors?.primary || '#3B82F6',
      secondary: websiteData?.designTokens?.colors?.secondary || '#8B5CF6',
      accent: websiteData?.designTokens?.colors?.accent || '#10B981',
      headingFont: websiteData?.designTokens?.typography?.fontFamily?.heading || 'Inter',
      bodyFont: websiteData?.designTokens?.typography?.fontFamily?.body || 'Inter'
    });
  }, [websiteData?.designTokens]);

  const { brandDNA, designTokens, sections, businessName, content, variationName } = websiteData;

  // Apply design tokens as CSS variables
  useEffect(() => {
    if (!designTokens) return;

    const root = document.documentElement;
    
    // Colors
    if (designTokens.colors) {
      root.style.setProperty('--color-primary', designTokens.colors.primary);
      root.style.setProperty('--color-secondary', designTokens.colors.secondary);
      root.style.setProperty('--color-accent', designTokens.colors.accent);
      
      // SLDS 2 Token naming
      root.style.setProperty('--slds-g-color-brand-base', designTokens.colors.primary);
      root.style.setProperty('--slds-g-color-brand-contrast', designTokens.colors.secondary);
      
      if (designTokens.colors.neutral) {
        Object.entries(designTokens.colors.neutral).forEach(([key, value]) => {
          root.style.setProperty(`--color-neutral-${key}`, value);
          root.style.setProperty(`--slds-g-color-neutral-base-${key}`, value);
        });
      }
    }

    // Typography
    if (designTokens.typography?.fontFamily) {
      root.style.setProperty('--font-heading', designTokens.typography.fontFamily.heading);
      root.style.setProperty('--font-body', designTokens.typography.fontFamily.body);
      
      // Load Google Fonts
      const fonts = [designTokens.typography.fontFamily.heading, designTokens.typography.fontFamily.body];
      const uniqueFonts = [...new Set(fonts)].filter(f => f && f !== 'system-ui');
      
      if (uniqueFonts.length > 0) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f.replace(' ', '+')}:wght@400;500;600;700`).join('&')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }

    // Spacing
    if (designTokens.spacing) {
      root.style.setProperty('--spacing-section', designTokens.spacing.section);
      root.style.setProperty('--spacing-component', designTokens.spacing.component);
      root.style.setProperty('--spacing-element', designTokens.spacing.element);
    }

    // Border Radius
    if (designTokens.borderRadius) {
      root.style.setProperty('--radius-small', designTokens.borderRadius.small);
      root.style.setProperty('--radius-medium', designTokens.borderRadius.medium);
      root.style.setProperty('--radius-large', designTokens.borderRadius.large);
    }

  }, [designTokens]);

  // Create default sections if none exist
  const displaySections = sections?.length > 0 ? sections : [
    { id: 'hero', type: 'hero', content: content?.hero || {} },
    { id: 'features', type: 'features', content: content?.features || {} },
    { id: 'testimonials', type: 'testimonials', content: content?.testimonials || {} },
    { id: 'cta', type: 'cta', content: content?.cta || {} },
    { id: 'footer', type: 'footer', content: {} }
  ];
  const existingTypeSet = new Set(displaySections.map((section) => normalizeSectionType(section.type)));
  const addableSections = AVAILABLE_SECTION_TYPES.filter(
    (option) => !existingTypeSet.has(normalizeSectionType(option.type))
  );

  // Human-AI Collaboration: Update section content
  const handleSectionUpdate = (sectionId, newContent) => {
    const updatedSections = displaySections.map(section => 
      section.id === sectionId 
        ? { ...section, content: newContent }
        : section
    );
      setWebsiteData({
        ...websiteData,
        sections: updatedSections,
        content: syncContentFromSections(updatedSections, websiteData.content || {})
      });
  };

  const handleSectionDelete = (sectionId) => {
    const sectionToRemove = displaySections.find((section) => section.id === sectionId);
    if (!sectionToRemove) return;

    const updatedSections = displaySections.filter((section) => section.id !== sectionId);

      setWebsiteData({
        ...websiteData,
        sections: updatedSections,
        content: syncContentFromSections(updatedSections, websiteData.content || {})
      });
    setRemovedSections((prev) => [...prev, sectionToRemove]);

    if (activeSectionId === sectionId) {
      setActiveSectionId(updatedSections[0]?.id || '');
    }
  };

  const handleRestoreSection = (sectionId) => {
    const sectionToRestore = removedSections.find((section) => section.id === sectionId);
    if (!sectionToRestore) return;

    const restoredSections = [...displaySections, sectionToRestore];
    setWebsiteData({
      ...websiteData,
      sections: restoredSections,
      content: syncContentFromSections(restoredSections, websiteData.content || {})
    });
    setRemovedSections((prev) => prev.filter((section) => section.id !== sectionId));
    setActiveSectionId(sectionToRestore.id);
  };

  const handleMoveSection = (sectionId, direction) => {
    const index = displaySections.findIndex(s => s.id === sectionId);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === displaySections.length - 1) return;

    const newSections = [...displaySections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    setWebsiteData({
      ...websiteData,
      sections: newSections,
      content: syncContentFromSections(newSections, websiteData.content || {})
    });
  };

  const handleAddSection = (type) => {
    const normalizedType = normalizeSectionType(type);
    if (!normalizedType) return;

    const newSection = {
      id: `${normalizedType}-${Date.now()}`,
      type: normalizedType,
      content: getDefaultSectionContent(normalizedType, businessName)
    };

    const footerIdx = displaySections.findIndex(s => normalizeSectionType(s.type) === "footer"); const updatedSections = [...displaySections]; if (footerIdx !== -1) { updatedSections.splice(footerIdx, 0, newSection); } else { updatedSections.push(newSection); }
    setWebsiteData({
      ...websiteData,
      sections: updatedSections,
      content: syncContentFromSections(updatedSections, websiteData.content || {})
    });
    setActiveSectionId(newSection.id);
  };

  const updateSectionField = (sectionId, updater) => {
    const section = displaySections.find((s) => s.id === sectionId);
    if (!section) return;

    const nextContent = typeof updater === 'function' ? updater(section.content || {}) : updater;
    handleSectionUpdate(sectionId, nextContent);
  };

  const applyTokenChanges = () => {
    const nextDesignTokens = {
      ...(websiteData.designTokens || {}),
      colors: {
        ...(websiteData.designTokens?.colors || {}),
        primary: tokenDraft.primary,
        secondary: tokenDraft.secondary,
        accent: tokenDraft.accent
      },
      typography: {
        ...(websiteData.designTokens?.typography || {}),
        fontFamily: {
          ...(websiteData.designTokens?.typography?.fontFamily || {}),
          heading: tokenDraft.headingFont,
          body: tokenDraft.bodyFont
        }
      }
    };

    setWebsiteData((prev) => ({
      ...prev,
      designTokens: nextDesignTokens
    }));
  };

  // Export website as JSON
  const handleExport = () => {
    const exportData = {
      meta: {
        businessName,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        designSystem: 'SLDS 2',
        variation: variationName
      },
      brandDNA,
      designTokens,
      sections: displaySections,
      content
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName?.toLowerCase().replace(/\s+/g, '-') || 'website'}-brand-system.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as CSS tokens
  const handleExportCSS = () => {
    let css = `/* SLDS 2 Design Tokens - Generated for ${businessName} */\n\n:root {\n`;
    
    if (designTokens?.colors) {
      css += `  /* Brand Colors */\n`;
      css += `  --slds-g-color-brand-base-50: ${designTokens.colors.primary};\n`;
      css += `  --slds-g-color-brand-base-contrast: ${designTokens.colors.secondary};\n`;
      css += `  --slds-g-color-accent: ${designTokens.colors.accent};\n\n`;
    }
    
    if (designTokens?.typography?.fontFamily) {
      css += `  /* Typography */\n`;
      css += `  --slds-g-font-family-heading: '${designTokens.typography.fontFamily.heading}', sans-serif;\n`;
      css += `  --slds-g-font-family-body: '${designTokens.typography.fontFamily.body}', sans-serif;\n\n`;
    }
    
    if (designTokens?.spacing) {
      css += `  /* Spacing */\n`;
      css += `  --slds-g-spacing-section: ${designTokens.spacing.section};\n`;
      css += `  --slds-g-spacing-component: ${designTokens.spacing.component};\n`;
      css += `  --slds-g-spacing-element: ${designTokens.spacing.element};\n\n`;
    }
    
    if (designTokens?.borderRadius) {
      css += `  /* Border Radius */\n`;
      css += `  --slds-g-radius-border-1: ${designTokens.borderRadius.small};\n`;
      css += `  --slds-g-radius-border-2: ${designTokens.borderRadius.medium};\n`;
      css += `  --slds-g-radius-border-3: ${designTokens.borderRadius.large};\n`;
    }
    
    css += `}\n`;
    
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName?.toLowerCase().replace(/\s+/g, '-') || 'brand'}-tokens.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getViewWidth = () => {
    switch (viewMode) {
      case 'tablet': return 'max-w-[768px] px-2';
      case 'mobile': return 'max-w-[375px] px-2';
      default: return 'w-full';
    }
  };

  const renderSection = (section) => {
    const sectionType = normalizeSectionType(section.type);
    const commonProps = {
      key: section.id,
      content: section.content,
      variant: section.variant,
      onContentUpdate: editMode ? (newContent) => handleSectionUpdate(section.id, newContent) : undefined
    };

    switch (sectionType) {
      case 'hero':
        return <Hero {...commonProps} />;
      case 'features':
        return <Features {...commonProps} />;
      case 'testimonials':
        return <Testimonials {...commonProps} />;
      case 'cta':
        return <CTA {...commonProps} />;
      case 'gallery':
        return <Gallery {...commonProps} />;
      case 'menu':
        return <Menu {...commonProps} />;
      case 'footer':
        return <Footer key={section.id} content={section.content} businessName={businessName} />;
      case 'contact':
        return <Contact {...commonProps} />;
      default:
        return null;
    }
  };

  const activeSection = displaySections.find((section) => section.id === activeSectionId) || displaySections[0] || null;
  const activeSectionType = normalizeSectionType(activeSection?.type);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <div
        className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40"
      >
        <div className="flex items-center gap-4">
          {/* Tab Navigation */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            {[
              { id: 'preview', icon: Eye, label: 'Preview' },
              { id: 'tokens', icon: Palette, label: 'Design System' },
              { id: 'slds', icon: Box, label: 'SLDS Components' },
              { id: 'export', icon: Code, label: 'Export' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="h-4 w-px bg-slate-700" />
          
          {/* Variation Badge */}
          {variationName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
              <Zap className="w-3 h-3" />
              {variationName} Style
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Viewport Selector */}
          {activeTab === 'preview' && (
            <div className="flex bg-slate-800 rounded-lg p-1">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id)}
                  className={`p-1.5 rounded-md transition ${
                    viewMode === view.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
          
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition ${
              editMode ? 'bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? 'Editing' : 'Edit'}
          </button>
          
          <button 
            onClick={onRegenerate}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex w-full min-w-0 items-start relative">
        {/* Main Content */}
        <div className={`min-w-0 flex-1 flex justify-center transition-all ${editMode && activeTab === 'preview' ? 'xl:pr-96' : ''}`}>
          {activeTab === 'preview' && (
            <div className={`w-full overflow-hidden transition-all ${getViewWidth()}`}>
              {/* Website Preview */}
              <div className={`bg-white min-h-screen website-preview-frame website-preview-frame--${viewMode}`}>
                {displaySections.length > 0 ? (
                  displaySections.map(renderSection)
                ) : (
                  <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
                    All sections removed. Restore one from the editor panel.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="p-8 max-w-5xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">SLDS 2 Design Tokens</h2>
                <p className="text-slate-400">AI-generated design system based on your brand identity</p>
              </div>
              
              {/* Color Tokens */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Color Tokens
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Primary', token: '--slds-g-color-brand-base', value: designTokens?.colors?.primary },
                    { name: 'Secondary', token: '--slds-g-color-brand-contrast', value: designTokens?.colors?.secondary },
                    { name: 'Accent', token: '--slds-g-color-accent', value: designTokens?.colors?.accent },
                    { name: 'Background', token: '--slds-g-color-neutral-base-1', value: designTokens?.colors?.neutral?.['50'] || '#F8FAFC' },
                  ].map((color) => (
                    <div key={color.name}>
                      <div 
                        className="h-24 rounded-xl mb-3 shadow-lg"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-sm font-medium text-white">{color.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{color.value}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">{color.token}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Tokens */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Typography Tokens
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">--slds-g-font-family-heading</p>
                    <p 
                      className="text-3xl font-bold text-white"
                      style={{ fontFamily: designTokens?.typography?.fontFamily?.heading }}
                    >
                      {designTokens?.typography?.fontFamily?.heading || 'Inter'}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">The quick brown fox jumps over the lazy dog</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">--slds-g-font-family-body</p>
                    <p 
                      className="text-xl text-white"
                      style={{ fontFamily: designTokens?.typography?.fontFamily?.body }}
                    >
                      {designTokens?.typography?.fontFamily?.body || 'Inter'}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">The quick brown fox jumps over the lazy dog</p>
                  </div>
                </div>
              </div>

              {/* Spacing & Radius */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Spacing Scale
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Section', value: designTokens?.spacing?.section || '96px' },
                      { name: 'Component', value: designTokens?.spacing?.component || '64px' },
                      { name: 'Element', value: designTokens?.spacing?.element || '16px' },
                    ].map((space) => (
                      <div key={space.name} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{space.name}</span>
                        <div className="flex items-center gap-2">
                            <div 
                              className="h-4 bg-blue-500/30 rounded"
                              style={{ width: parseSizeValue(space.value) / 2 }}
                            />
                          <span className="text-xs text-slate-500 font-mono w-12 text-right">{space.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    Border Radius
                  </h3>
                  <div className="flex gap-4">
                    {[
                      { name: 'Small', value: designTokens?.borderRadius?.small || '4px' },
                      { name: 'Medium', value: designTokens?.borderRadius?.medium || '8px' },
                      { name: 'Large', value: designTokens?.borderRadius?.large || '16px' },
                    ].map((radius) => (
                      <div key={radius.name} className="text-center">
                        <div 
                          className="w-16 h-16 bg-slate-700 mb-2"
                          style={{ borderRadius: radius.value }}
                        />
                        <p className="text-xs text-slate-400">{radius.name}</p>
                        <p className="text-xs text-slate-600 font-mono">{radius.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'slds' && (
            <div className="p-8 max-w-5xl mx-auto">
              <div className="mb-8 p-6 bg-linear-to-r from-blue-900/40 to-slate-900/60 rounded-2xl border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                      <Box className="text-blue-400 w-6 h-6" />
                      SLDS 2 Component Library
                    </h2>
                    <p className="text-slate-300">Components styled with your dynamic BrandMind AI tokens</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Tokens Injected</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Buttons (slds-button)</h3>
                <p className="text-slate-400 text-sm mb-6 relative z-10">Primary interactive elements for user actions</p>
                <div className="flex flex-wrap items-center gap-6 relative z-10 p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                  <button 
                    className="px-6 py-3 rounded-lg font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ backgroundColor: designTokens?.colors?.primary, boxShadow: `0 4px 14px 0 ${designTokens?.colors?.primary}40` }}
                  >
                    Primary Action
                  </button>
                  <button 
                    className="px-6 py-3 rounded-lg font-medium transition hover:-translate-y-0.5 hover:bg-slate-800/80"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: `2px solid ${designTokens?.colors?.primary}`,
                      color: designTokens?.colors?.primary 
                    }}
                  >
                    Outline Outline
                  </button>
                  <button 
                    className="px-6 py-3 rounded-lg font-medium text-white transition hover:-translate-y-0.5 shadow-lg"
                    style={{ backgroundColor: designTokens?.colors?.secondary, boxShadow: `0 4px 14px 0 ${designTokens?.colors?.secondary}40` }}
                  >
                    Secondary Button
                  </button>
                  <button 
                    className="px-6 py-3 rounded-lg font-medium text-white bg-slate-800 border border-slate-700 transition hover:bg-slate-700 hover:-translate-y-0.5"
                  >
                    Neutral Button
                  </button>
                </div>
              </div>

              {/* Content Cards */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-2">Cards (slds-card)</h3>
                <p className="text-slate-400 text-sm mb-6">Structural containers for grouped content</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      style={{ borderRadius: designTokens?.borderRadius?.medium }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: i === 1 ? designTokens?.colors?.primary : i === 2 ? designTokens?.colors?.secondary : designTokens?.colors?.accent }}></div>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${designTokens?.colors?.primary}15` }}
                      >
                        <CheckCircle className="w-6 h-6" style={{ color: designTokens?.colors?.primary }} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">Card Component {i}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        This card container implements the generated border-radius tokens and utilizes the primary brand colors for its visual accents.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Badges */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-8 shadow-xl mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Badges (slds-badge)</h3>
                <p className="text-slate-400 text-sm mb-6">Status indicators and tagging</p>
                <div className="flex flex-wrap gap-4 p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${designTokens?.colors?.primary}20`, color: designTokens?.colors?.primary }}
                  >
                    Primary Status
                  </span>
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${designTokens?.colors?.secondary}20`, color: designTokens?.colors?.secondary }}
                  >
                    Secondary Status
                  </span>
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${designTokens?.colors?.accent}20`, color: designTokens?.colors?.accent }}
                  >
                    Accent Status
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="p-8 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                  <Download className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Export Your Brand Assets</h2>
                <p className="text-slate-400 text-lg">
                  Download your AI-generated design system tokens or the complete website configuration
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export JSON */}
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Complete Configuration</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Full JSON package including Brand DNA, website copy, layout structures, and all design tokens.
                  </p>
                  <button
                    onClick={handleExport}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition"
                  >
                    Download JSON File
                  </button>
                  <div className="w-full mt-4 p-4 bg-slate-950 rounded-lg text-left overflow-hidden">
                    <pre className="text-xs text-slate-500 font-mono">
{`{
  "meta": {
    "businessName": "${businessName}",
    "variation": "${variationName || 'custom'}"
  },
  "designTokens": { ... },
  "content": { ... }
}`}
                    </pre>
                  </div>
                </div>

                {/* Export CSS */}
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">SLDS CSS Tokens</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    A ready-to-use CSS file containing all your brand colors, typography, and spacing variables.
                  </p>
                  <button
                    onClick={handleExportCSS}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition"
                  >
                    Download CSS Variables
                  </button>
                  <div className="w-full mt-4 p-4 bg-slate-950 rounded-lg text-left overflow-hidden">
                    <pre className="text-xs text-slate-500 font-mono">
{`:root {
  --slds-g-color-brand: ${designTokens?.colors?.primary};
  --slds-g-font-family: '${designTokens?.typography?.fontFamily?.heading}';
  /* ... */
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor Sidebar */}
        {editMode && activeTab === 'preview' && (
          <aside
            className="hidden xl:block fixed right-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto p-4 z-50"
            style={{ top: '132px' }}
          >
            <h3 className="text-white font-semibold mb-3">Edit Sections</h3>

            <div className="space-y-2 mb-4">
              {displaySections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border ${
                    activeSection?.id === section.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(section.id, 'down')}
                        disabled={index === displaySections.length - 1}
                        className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className="text-left flex-1"
                    >
                      <p className="text-sm font-medium text-white capitalize">{section.type}</p>
                      <p className="text-xs text-slate-400">Editable</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionDelete(section.id)}
                      className="p-2 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 shrink-0"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 border-t border-slate-700 pt-4">
              <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Add section</h4>
              {addableSections.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {addableSections.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleAddSection(option.type)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-slate-200 transition hover:border-blue-500/60 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-xs text-slate-400">
                  All standard sections are already added.
                </p>
              )}
            </div>

            {removedSections.length > 0 && (
              <div className="mb-4 border-t border-slate-700 pt-4">
                <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Removed sections</h4>
                <div className="space-y-2">
                  {removedSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleRestoreSection(section.id)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-green-500/50 text-slate-200"
                    >
                      <span className="text-sm capitalize">{section.type}</span>
                      <span className="block text-xs text-green-400">Restore</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 border-t border-slate-700 pt-4">
              <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Design controls</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Primary color</label>
                  <input
                    type="color"
                    value={tokenDraft.primary}
                    onChange={(e) => setTokenDraft((prev) => ({ ...prev, primary: e.target.value }))}
                    className="w-full h-9 rounded bg-slate-800 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Secondary color</label>
                  <input
                    type="color"
                    value={tokenDraft.secondary}
                    onChange={(e) => setTokenDraft((prev) => ({ ...prev, secondary: e.target.value }))}
                    className="w-full h-9 rounded bg-slate-800 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Accent color</label>
                  <input
                    type="color"
                    value={tokenDraft.accent}
                    onChange={(e) => setTokenDraft((prev) => ({ ...prev, accent: e.target.value }))}
                    className="w-full h-9 rounded bg-slate-800 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Heading font</label>
                  <select
                    value={tokenDraft.headingFont}
                    onChange={(e) => setTokenDraft((prev) => ({ ...prev, headingFont: e.target.value }))}
                    className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Body font</label>
                  <select
                    value={tokenDraft.bodyFont}
                    onChange={(e) => setTokenDraft((prev) => ({ ...prev, bodyFont: e.target.value }))}
                    className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={applyTokenChanges}
                  className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
                >
                  Apply design changes
                </button>
              </div>
            </div>

            {activeSection && (
              <div className="space-y-3 border-t border-slate-700 pt-4">
                {activeSectionType === 'hero' && (
                  <>
                    <LabeledInput
                      label="Headline"
                      value={activeSection.content?.headline || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, headline: v }))}
                    />
                    <LabeledTextarea
                      label="Subheadline"
                      value={activeSection.content?.subheadline || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, subheadline: v }))}
                    />
                    <LabeledInput
                      label="CTA text"
                      value={activeSection.content?.cta?.text || ''}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          cta: { ...(content.cta || {}), text: v }
                        }))
                      }
                    />
                    <LabeledInput
                      label="Hero image URL"
                      value={activeSection.content?.imageUrl || ''}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          imageUrl: v,
                          imageSource: v ? 'custom' : 'none'
                        }))
                      }
                    />
                    <LabeledInput
                      label="Overlay strength (0-100)"
                      value={String(activeSection.content?.overlayStrength ?? 55)}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          overlayStrength: Math.max(0, Math.min(100, Number(v) || 55))
                        }))
                      }
                    />
                  </>
                )}

                {activeSectionType === 'features' && (
                  <>
                    <LabeledInput
                      label="Section title"
                      value={activeSection.content?.title || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, title: v }))}
                    />
                    <LabeledTextarea
                      label="Items (Title | Description per line)"
                      value={formatFeaturesTextarea(activeSection.content)}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          items: parseFeaturesTextarea(v),
                          features: parseFeaturesTextarea(v)
                        }))
                      }
                    />
                  </>
                )}

                {activeSectionType === 'testimonials' && (
                  <>
                    <LabeledInput
                      label="Section title"
                      value={activeSection.content?.title || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, title: v }))}
                    />
                    <LabeledTextarea
                      label="Testimonials (Quote | Author | Role)"
                      value={formatTestimonialsTextarea(activeSection.content)}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          testimonials: parseTestimonialsTextarea(v)
                        }))
                      }
                    />
                  </>
                )}

                {activeSectionType === 'cta' && (
                  <>
                    <LabeledInput
                      label="Headline"
                      value={activeSection.content?.headline || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, headline: v }))}
                    />
                    <LabeledTextarea
                      label="Supporting text"
                      value={activeSection.content?.supportingText || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, supportingText: v }))}
                    />
                    <LabeledInput
                      label="CTA text"
                      value={activeSection.content?.cta?.text || ''}
                      onChange={(v) =>
                        updateSectionField(activeSection.id, (content) => ({
                          ...content,
                          cta: { ...(content.cta || {}), text: v }
                        }))
                      }
                    />
                  </>
                )}

                {activeSectionType === 'footer' && (
                  <LabeledTextarea
                    label="Footer description"
                    value={activeSection.content?.description || ''}
                    onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, description: v }))}
                  />
                )}

                {activeSectionType === 'contact' && (
                  <>
                    <LabeledInput
                      label="Section title"
                      value={activeSection.content?.title || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, title: v }))}
                    />
                    <LabeledTextarea
                      label="Description"
                      value={activeSection.content?.description || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, description: v }))}
                    />
                    <LabeledInput
                      label="Phone"
                      value={activeSection.content?.phone || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, phone: v }))}
                    />
                    <LabeledInput
                      label="Email"
                      value={activeSection.content?.email || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, email: v }))}
                    />
                    <LabeledInput
                      label="Address"
                      value={activeSection.content?.address || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, address: v }))}
                    />
                    <LabeledInput
                      label="Button text"
                      value={activeSection.content?.buttonText || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, buttonText: v }))}
                    />
                    <LabeledInput
                      label="Button link"
                      value={activeSection.content?.buttonLink || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, buttonLink: v }))}
                    />
                  </>
                )}

                {activeSectionType === 'gallery' && (
                  <>
                    <LabeledInput
                      label="Section title"
                      value={activeSection.content?.title || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, title: v }))}
                    />
                    <LabeledInput
                      label="Subtitle"
                      value={activeSection.content?.subtitle || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, subtitle: v }))}
                    />
                    
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Images</span>
                      </div>
                      
                      {(activeSection.content?.images || []).map((img, i) => (
                        <div key={i} className="mb-4 p-3 bg-slate-800 rounded-lg space-y-3 relative group">
                          <button
                            type="button"
                            onClick={() => {
                              updateSectionField(activeSection.id, (content) => {
                                const newImages = [...(content.images || [])];
                                newImages.splice(i, 1);
                                return { ...content, images: newImages };
                              });
                            }}
                            className="absolute top-2 right-2 p-1 text-rose-400 hover:bg-rose-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <LabeledInput
                            label={`Image ${i+1} URL`}
                            value={img.url || ''}
                            onChange={(v) => {
                              updateSectionField(activeSection.id, (content) => {
                                const newImages = [...(content.images || [])];
                                newImages[i] = { ...newImages[i], url: v };
                                return { ...content, images: newImages };
                              });
                            }}
                          />
                          <LabeledInput
                            label="Caption"
                            value={img.caption || ''}
                            onChange={(v) => {
                              updateSectionField(activeSection.id, (content) => {
                                const newImages = [...(content.images || [])];
                                newImages[i] = { ...newImages[i], caption: v };
                                return { ...content, images: newImages };
                              });
                            }}
                          />
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex-1 w-full px-3 py-2 mt-2 text-sm text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition"
                          onClick={() => {
                            updateSectionField(activeSection.id, (content) => {
                              return {
                                ...content,
                                images: [...(content.images || []), { url: 'https://via.placeholder.com/600', caption: 'New Image' }]
                              };
                            });
                          }}
                        >
                          + Add Empty Image
                        </button>
                      </div>

                      <ImageUploadHelper 
                        label="+ Upload Local Files"
                        onImagesAdded={(newUrls) => {
                          updateSectionField(activeSection.id, (content) => {
                            const existingImages = content.images || [];
                            const appended = newUrls.map(url => ({ url, caption: '' }));
                            return { ...content, images: [...existingImages, ...appended] };
                          });
                        }}
                      />
                    </div>
                  </>
                )}

                {activeSectionType === 'menu' && (
                  <>
                    <LabeledInput
                      label="Section title"
                      value={activeSection.content?.title || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, title: v }))}
                    />
                    <LabeledInput
                      label="Description"
                      value={activeSection.content?.description || ''}
                      onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, description: v }))}
                    />

                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Menu Items</span>
                      </div>
                      
                      {(activeSection.content?.items || []).map((item, i) => (
                        <div key={i} className="mb-4 p-3 bg-slate-800 rounded-lg space-y-3 relative group">
                          <button
                            type="button"
                            onClick={() => {
                              updateSectionField(activeSection.id, (content) => {
                                const newItems = [...(content.items || [])];
                                newItems.splice(i, 1);
                                return { ...content, items: newItems };
                              });
                            }}
                            className="absolute top-2 right-2 p-1 text-rose-400 hover:bg-rose-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <LabeledInput
                              label="Name"
                              value={item.name || ''}
                              onChange={(v) => {
                                updateSectionField(activeSection.id, (content) => {
                                  const newItems = [...(content.items || [])];
                                  newItems[i] = { ...newItems[i], name: v };
                                  return { ...content, items: newItems };
                                });
                              }}
                            />
                            <LabeledInput
                              label="Price"
                              value={item.price || ''}
                              onChange={(v) => {
                                updateSectionField(activeSection.id, (content) => {
                                  const newItems = [...(content.items || [])];
                                  newItems[i] = { ...newItems[i], price: v };
                                  return { ...content, items: newItems };
                                });
                              }}
                            />
                          </div>

                          <LabeledTextarea
                            label="Description"
                            value={item.description || ''}
                            onChange={(v) => {
                              updateSectionField(activeSection.id, (content) => {
                                const newItems = [...(content.items || [])];
                                newItems[i] = { ...newItems[i], description: v };
                                return { ...content, items: newItems };
                              });
                            }}
                          />

                          <LabeledInput
                            label="Image URL"
                            value={item.imageUrl || ''}
                            onChange={(v) => {
                              updateSectionField(activeSection.id, (content) => {
                                const newItems = [...(content.items || [])];
                                newItems[i] = { ...newItems[i], imageUrl: v };
                                return { ...content, items: newItems };
                              });
                            }}
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        className="w-full px-3 py-2 mb-2 text-sm text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition"
                        onClick={() => {
                          updateSectionField(activeSection.id, (content) => {
                            return {
                              ...content,
                              items: [...(content.items || []), { name: 'New Item', price: '$0', description: '', imageUrl: '' }]
                            };
                          });
                        }}
                      >
                        + Add Menu Item
                      </button>

                      <ImageUploadHelper 
                        label="+ Upload Image to Last Item"
                        onImagesAdded={(newUrls) => {
                          if(!newUrls.length) return;
                          updateSectionField(activeSection.id, (content) => {
                            const items = [...(content.items || [])];
                            if (items.length > 0) {
                              items[items.length - 1].imageUrl = newUrls[0];
                            }
                            return { ...content, items };
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function sanitizeWebsiteData(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const next = {
    ...DEFAULT_WEBSITE_DATA,
    ...raw,
    designTokens: {
      ...DEFAULT_WEBSITE_DATA.designTokens,
      ...(raw.designTokens || {}),
      colors: {
        ...DEFAULT_WEBSITE_DATA.designTokens.colors,
        ...(raw.designTokens?.colors || {}),
        neutral: {
          ...DEFAULT_WEBSITE_DATA.designTokens.colors.neutral,
          ...(raw.designTokens?.colors?.neutral || {})
        }
      },
      typography: {
        ...DEFAULT_WEBSITE_DATA.designTokens.typography,
        ...(raw.designTokens?.typography || {}),
        fontFamily: {
          ...DEFAULT_WEBSITE_DATA.designTokens.typography.fontFamily,
          ...(raw.designTokens?.typography?.fontFamily || {})
        }
      },
      spacing: {
        ...DEFAULT_WEBSITE_DATA.designTokens.spacing,
        ...(raw.designTokens?.spacing || {})
      },
      borderRadius: {
        ...DEFAULT_WEBSITE_DATA.designTokens.borderRadius,
        ...(raw.designTokens?.borderRadius || {})
      }
    }
  };

  const safeSections = Array.isArray(raw.sections)
    ? raw.sections
        .filter((section) => section && typeof section === 'object' && section.type)
        .map((section, index) => ({
          id: section.id || `${section.type}-${index + 1}`,
          type: section.type,
          variant: section.variant,
          content: section.content && typeof section.content === 'object' ? section.content : {}
        }))
    : [];

  const fallbackSections = [
    { id: 'hero-1', type: 'hero', content: raw.content?.hero || {} },
    { id: 'features-1', type: 'features', content: raw.content?.features || {} },
    { id: 'testimonials-1', type: 'testimonials', content: raw.content?.testimonials || {} },
    { id: 'cta-1', type: 'cta', content: raw.content?.cta || {} },
    { id: 'footer-1', type: 'footer', content: raw.content?.footer || {} }
  ];

  const sections = safeSections.length > 0 ? safeSections : fallbackSections;

  next.sections = sections;
  next.content = syncContentFromSections(sections, raw.content || {});
  return next;
}

function getDefaultSectionContent(type, businessName) {
  const name = businessName || 'Our Business';
  const defaults = {
    hero: {
      headline: `Welcome to ${name}`,
      subheadline: 'We help you achieve exceptional results with a customer-first approach.',
      cta: { text: 'Get Started', link: '#contact' }
    },
    features: {
      title: 'Why Choose Us',
      items: [
        { icon: 'star', title: 'Top Quality', description: 'We focus on quality you can feel immediately.' },
        { icon: 'users', title: 'Expert Team', description: 'Experienced professionals ready to help.' },
        { icon: 'zap', title: 'Fast Service', description: 'Quick responses and efficient delivery.' }
      ],
      features: [
        { icon: 'star', title: 'Top Quality', description: 'We focus on quality you can feel immediately.' },
        { icon: 'users', title: 'Expert Team', description: 'Experienced professionals ready to help.' },
        { icon: 'zap', title: 'Fast Service', description: 'Quick responses and efficient delivery.' }
      ]
    },
    testimonials: {
      title: 'What Clients Say',
      testimonials: [
        { quote: 'Amazing experience from start to finish.', author: 'Happy Client', role: 'Customer' }
      ]
    },
    cta: {
      headline: 'Ready to Work Together?',
      supportingText: 'Contact us today and let us build something great for your brand.',
      cta: { text: 'Contact Us', link: '#contact' }
    },
    gallery: {
      title: 'Our Gallery',
      subtitle: 'A glimpse into what we do.',
      images: [
        { url: 'https://images.unsplash.com/photo-1542314831-c6a4d14fa0c5?auto=format&fit=crop&w=600&q=80', caption: 'Atmosphere' },
        { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80', caption: 'Quality' },
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', caption: 'Experience' }
      ]
    },
    menu: {
      title: 'Menu & Pricing',
      description: 'Explore our offerings and find the perfect fit for you.',
      items: [
        { name: 'Signature Service', price: '$49', description: 'Our most popular offering, crafted with care.', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80' },
        { name: 'Premium Package', price: '$99', description: 'Everything you need for a complete experience.', imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200&q=80' },
        { name: 'Essential Add-on', price: '$19', description: 'The perfect complement to your primary choice.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' }
      ]
    },
    contact: {
      title: 'Contact Us',
      description: 'We would love to hear from you. Reach out and we will get back shortly.',
      phone: '+1 (555) 123-4567',
      email: 'hello@yourbusiness.com',
      address: '123 Main Street, Your City',
      buttonText: 'Send Message',
      buttonLink: '#'
    },
    footer: {
      description: `${name} - Built with care.`
    }
  };

  return defaults[type] || {};
}

function parseSizeValue(value) {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : 0;
}

function normalizeSectionType(type) {
  return String(type || '').trim().toLowerCase();
}

function syncContentFromSections(sections, existingContent) {
  const nextContent = { ...(existingContent || {}) };
  sections.forEach((section) => {
    if (section.type && section.content) {
      nextContent[section.type] = section.content;
    }
  });
  return nextContent;
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
  );
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
  );
}

function ImageUploadHelper({ label, onImagesAdded }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const urls = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        urls.push(event.target.result);
        if (urls.length === files.length) {
          onImagesAdded(urls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <label className="block mt-2">
      <div className="w-full px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 text-sm cursor-pointer text-center transition">
        {label || "Upload local images"}
      </div>
      <input 
        type="file" 
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
}

function formatFeaturesTextarea(content) {
  const items = content?.items || content?.features || [];
  return items.map((item) => `${item.title || ''} | ${item.description || ''}`).join('\n');
}

function parseFeaturesTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, description] = line.split('|').map((part) => (part || '').trim());
      return {
        icon: ['star', 'users', 'zap', 'target'][index % 4],
        title: title || `Feature ${index + 1}`,
        description: description || 'Feature description'
      };
    });
}

function formatTestimonialsTextarea(content) {
  const items = content?.testimonials || [];
  return items
    .map((item) => `${item.quote || ''} | ${item.author || ''} | ${item.role || ''}`)
    .join('\n');
}

function parseTestimonialsTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [quote, author, role] = line.split('|').map((part) => (part || '').trim());
      return {
        quote: quote || 'Great service!',
        author: author || `Customer ${index + 1}`,
        role: role || 'Customer'
      };
    });
}

function formatGalleryTextarea(content) {
  const items = content?.images || [];
  return items.map((item) => `${item.url || ''} | ${item.caption || ''}`).join('\n');
}

function parseGalleryTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, caption] = line.split('|').map((part) => (part || '').trim());
      return {
        url: url || 'https://via.placeholder.com/600',
        caption: caption || ''
      };
    });
}

function formatMenuTextarea(content) {
  const items = content?.items || [];
  return items
    .map((item) => `${item.name || ''} | ${item.price || ''} | ${item.description || ''} | ${item.imageUrl || ''}`)
    .join('\n');
}

function parseMenuTextarea(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, price, description, imageUrl] = line.split('|').map((part) => (part || '').trim());
      return {
        name: name || `Item ${index + 1}`,
        price: price || '$0',
        description: description || 'Item description',
        imageUrl: imageUrl || ''
      };
    });
}
