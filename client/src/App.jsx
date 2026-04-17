import { useState } from 'react'
import './index.css'
import BrandInputForm from './components/builder/BrandInputForm'
import BrandAnalysisDashboard from './components/analysis/BrandAnalysisDashboard'
import DesignVariations from './components/variations/DesignVariations'
import WebsitePreview from './components/preview/WebsitePreview'
import { Sparkles, Brain, Layout, Globe } from 'lucide-react'

// Steps in the brand intelligence flow
const STEPS = [
  { id: 'input', label: 'Brand Input', icon: Sparkles },
  { id: 'analysis', label: 'AI Analysis', icon: Brain },
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

  const handleProceedToVariations = () => {
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
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block text-lg sm:text-xl font-bold text-blue-400 leading-none">
                BrandMind AI
              </span>
              <span className="mt-1 block text-[11px] sm:text-xs text-slate-500 leading-none">Powered by SLDS 2</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            {/* Step Progress */}
            {currentStep !== 'input' && (
              <div className="flex-1 min-w-0 overflow-x-auto pb-1 lg:overflow-visible">
                <div className="flex items-center gap-1 min-w-max lg:min-w-0 lg:flex-nowrap">
                  {STEPS.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = index === currentStepIndex
                    const isCompleted = index < currentStepIndex

                    return (
                      <div key={step.id} className="flex items-center shrink-0">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
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
              </div>
            )}

            {currentStep !== 'input' && (
              <button
                onClick={handleStartOver}
                className="shrink-0 text-xs sm:text-sm text-slate-400 hover:text-white transition whitespace-nowrap"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {currentStep === 'input' && (
          <BrandInputForm onComplete={handleBrandAnalysisComplete} />
        )}

        {currentStep === 'analysis' && brandData && (
          <BrandAnalysisDashboard
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
            data={selectedVariation || brandData.variations[0]} 
            onRegenerate={handleStartOver}
          />
        )}
      </main>
    </div>
  )
}

export default App
