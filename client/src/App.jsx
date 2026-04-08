import { useState } from 'react'
import './index.css'
import BrandInputForm from './components/builder/BrandInputForm'
import BrandAnalysisDashboard from './components/analysis/BrandAnalysisDashboard'
import BrandTuningStudio from './components/tuning/BrandTuningStudio'
import DesignVariations from './components/variations/DesignVariations'
import WebsitePreview from './components/preview/WebsitePreview'
import { Sparkles, Brain, Palette, Layout, Globe } from 'lucide-react'

// Steps in the brand intelligence flow
const STEPS = [
  { id: 'input', label: 'Brand Input', icon: Sparkles },
  { id: 'analysis', label: 'AI Analysis', icon: Brain },
  { id: 'tuning', label: 'Brand Tuning', icon: Palette },
  { id: 'variations', label: 'Variations', icon: Layout },
  { id: 'preview', label: 'Final Website', icon: Globe },
]

function App() {
  const [currentStep, setCurrentStep] = useState('input')
  const [brandData, setBrandData] = useState(null)
  const [selectedVariation, setSelectedVariation] = useState(null)

  const handleBrandAnalysisComplete = (data) => {
    setBrandData(data)
    setCurrentStep('analysis')
  }

  const handleProceedToTuning = () => {
    setCurrentStep('tuning')
  }

  const handleProceedToVariations = (tunedData) => {
    if (tunedData) {
      setBrandData(tunedData)
    }
    setCurrentStep('variations')
  }

  const handleVariationSelected = (variation) => {
    setSelectedVariation(variation)
    setCurrentStep('preview')
  }

  const handleStartOver = () => {
    setCurrentStep('input')
    setBrandData(null)
    setSelectedVariation(null)
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BrandMind AI
              </span>
              <span className="text-xs text-slate-500 block">Powered by SLDS 2</span>
            </div>
          </div>

          {/* Step Progress */}
          {currentStep !== 'input' && (
            <div className="flex items-center gap-1">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStepIndex
                const isCompleted = index < currentStepIndex
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : isCompleted 
                            ? 'bg-slate-700 text-slate-300' 
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{step.label}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${
                        isCompleted ? 'bg-blue-600' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {currentStep !== 'input' && (
            <button
              onClick={handleStartOver}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {currentStep === 'input' && (
          <BrandInputForm onComplete={handleBrandAnalysisComplete} />
        )}
        
        {currentStep === 'analysis' && brandData && (
          <BrandAnalysisDashboard 
            data={brandData} 
            onProceed={handleProceedToTuning}
          />
        )}

        {currentStep === 'tuning' && brandData && (
          <BrandTuningStudio 
            data={brandData}
            onProceed={handleProceedToVariations}
          />
        )}

        {currentStep === 'variations' && brandData && (
          <DesignVariations 
            data={brandData}
            onSelect={handleVariationSelected}
          />
        )}
        
        {currentStep === 'preview' && brandData && (
          <WebsitePreview 
            data={selectedVariation || brandData} 
            onRegenerate={handleStartOver}
          />
        )}
      </main>
    </div>
  )
}

export default App
