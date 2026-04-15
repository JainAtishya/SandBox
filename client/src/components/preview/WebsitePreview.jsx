import { useEffect, useState } from 'react';
import Hero from '../core/Hero';
import Features from '../core/Features';
import Testimonials from '../core/Testimonials';
import CTA from '../core/CTA';
import Footer from '../core/Footer';
import { Download, RefreshCw, Eye, Code, Palette, Edit3, Monitor, Tablet, Smartphone, CheckCircle, Zap, Box, Trash2 } from 'lucide-react';

export default function WebsitePreview({ data, onRegenerate }) {
  const [websiteData, setWebsiteData] = useState(data);
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
      sections,
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
    const commonProps = {
      key: section.id,
      content: section.content,
      variant: section.variant,
      onContentUpdate: editMode ? (newContent) => handleSectionUpdate(section.id, newContent) : undefined
    };

    switch (section.type) {
      case 'hero':
        return <Hero {...commonProps} />;
      case 'features':
        return <Features {...commonProps} />;
      case 'testimonials':
        return <Testimonials {...commonProps} />;
      case 'cta':
        return <CTA {...commonProps} />;
      case 'footer':
        return <Footer key={section.id} content={section.content} businessName={businessName} />;
      default:
        return null;
    }
  };

  const activeSection = displaySections.find((section) => section.id === activeSectionId) || displaySections[0] || null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-[73px] z-40">
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
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${editMode && activeTab === 'preview' ? 'xl:pr-96' : ''}`}>
          {activeTab === 'preview' && (
            <div className={`mx-auto transition-all ${getViewWidth()}`}>
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
                            style={{ width: parseInt(space.value) / 2 }}
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">SLDS 2 Component Library</h2>
                <p className="text-slate-400">Components styled with your brand tokens</p>
              </div>

              {/* Buttons */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Buttons (slds-button)</h3>
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="px-6 py-2.5 rounded-lg font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: designTokens?.colors?.primary }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-6 py-2.5 rounded-lg font-medium transition hover:opacity-90"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: `2px solid ${designTokens?.colors?.primary}`,
                      color: designTokens?.colors?.primary 
                    }}
                  >
                    Outline Button
                  </button>
                  <button 
                    className="px-6 py-2.5 rounded-lg font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: designTokens?.colors?.secondary }}
                  >
                    Secondary Button
                  </button>
                  <button 
                    className="px-6 py-2.5 rounded-lg font-medium text-white bg-slate-700 transition hover:bg-slate-600"
                  >
                    Neutral Button
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cards (slds-card)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="bg-white p-6 rounded-xl"
                      style={{ borderRadius: designTokens?.borderRadius?.large || '16px' }}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${designTokens?.colors?.primary}15` }}
                      >
                        <CheckCircle style={{ color: designTokens?.colors?.primary }} className="w-6 h-6" />
                      </div>
                      <h4 
                        className="font-semibold text-slate-800 mb-2"
                        style={{ fontFamily: designTokens?.typography?.fontFamily?.heading }}
                      >
                        Card Title {i}
                      </h4>
                      <p className="text-sm text-slate-600">
                        This card uses your brand tokens for styling.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Form Elements (slds-input)</h3>
                <div className="grid grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Text Input</label>
                    <input 
                      type="text" 
                      placeholder="Enter text..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2"
                      style={{ 
                        borderRadius: designTokens?.borderRadius?.medium,
                        '--tw-ring-color': designTokens?.colors?.primary 
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                      style={{ borderRadius: designTokens?.borderRadius?.medium }}
                    >
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Badge/Pills */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Badges (slds-badge)</h3>
                <div className="flex flex-wrap gap-3">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: designTokens?.colors?.primary }}
                  >
                    Primary
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: designTokens?.colors?.secondary }}
                  >
                    Secondary
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: designTokens?.colors?.accent }}
                  >
                    Accent
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${designTokens?.colors?.primary}15`,
                      color: designTokens?.colors?.primary
                    }}
                  >
                    Light Primary
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="p-8 max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Export Your Brand System</h2>
                <p className="text-slate-400">Download your design tokens and website data</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <button
                  onClick={handleExport}
                  className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-left hover:border-blue-500/50 transition group"
                >
                  <Code className="w-10 h-10 mb-4 text-blue-400 group-hover:scale-110 transition" />
                  <h3 className="text-lg font-semibold text-white mb-2">JSON Export</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Complete brand DNA, design tokens, and content as structured JSON
                  </p>
                  <span className="text-sm text-blue-400">Download JSON →</span>
                </button>
                
                <button
                  onClick={handleExportCSS}
                  className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-left hover:border-purple-500/50 transition group"
                >
                  <Palette className="w-10 h-10 mb-4 text-purple-400 group-hover:scale-110 transition" />
                  <h3 className="text-lg font-semibold text-white mb-2">CSS Tokens</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    SLDS 2 compatible CSS custom properties for your project
                  </p>
                  <span className="text-sm text-purple-400">Download CSS →</span>
                </button>
              </div>

              {/* JSON Preview */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Export Preview</h3>
                <pre className="bg-slate-950 rounded-xl p-4 text-sm overflow-auto max-h-96 text-green-400 font-mono">
{JSON.stringify({
  meta: { businessName, designSystem: 'SLDS 2', variation: variationName },
  brandDNA,
  designTokens
}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'preview' && editMode && (
          <aside className="hidden xl:block fixed right-0 top-[132px] bottom-0 w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto p-4">
            <h3 className="text-white font-semibold mb-3">Edit Sections</h3>

            <div className="space-y-2 mb-4">
              {displaySections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border ${
                    activeSection?.id === section.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
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
                      className="p-2 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                    {['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lora', 'Merriweather'].map((font) => (
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
                    {['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lora', 'Merriweather'].map((font) => (
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
                {activeSection.type === 'hero' && (
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
                  </>
                )}

                {activeSection.type === 'features' && (
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

                {activeSection.type === 'testimonials' && (
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

                {activeSection.type === 'cta' && (
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

                {activeSection.type === 'footer' && (
                  <LabeledTextarea
                    label="Footer description"
                    value={activeSection.content?.description || ''}
                    onChange={(v) => updateSectionField(activeSection.id, (content) => ({ ...content, description: v }))}
                  />
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
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
