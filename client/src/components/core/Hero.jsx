import { ArrowRight } from 'lucide-react';

export default function Hero({ content, variant = 'centered' }) {
  const { headline, subheadline, cta, imageUrl, imagePosition, imageAlt } = content || {};
  const fullText = `${headline || ''} ${subheadline || ''}`.toLowerCase();
  const isPremium = /premium|luxury|exclusive|elegant|sophisticated|high-end/.test(fullText);
  const hasHeroImage = typeof imageUrl === 'string' && imageUrl.trim().length > 0;
  const baseGradient = isPremium
    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #111827 100%)'
    : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)';

  const sectionStyle = { background: baseGradient };

  return (
    <section 
      className="slds-section relative overflow-hidden"
      style={sectionStyle}
    >
      {/* SLDS Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: isPremium
            ? `radial-gradient(circle at 25% 25%, rgba(250,204,21,0.9) 1px, transparent 1px)`
            : `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
          backgroundSize: isPremium ? '70px 70px' : '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`w-full min-h-[52vh] py-3 sm:py-6 ${hasHeroImage ? 'grid items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]' : 'flex flex-col justify-center text-center'}`}>
          <div className={`w-full ${hasHeroImage ? 'mx-auto max-w-[62ch] text-center lg:mx-0 lg:max-w-[58ch] lg:text-left' : 'mx-auto max-w-[68ch]'}`}>
          {/* Headline */}
          <h1 
            className="font-bold text-white mb-5 leading-tight animate-slide-up"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4.8vw, 4.25rem)',
              lineHeight: 1.12
            }}
          >
            {headline || 'Welcome to Our Business'}
          </h1>

          {/* Subheadline */}
            <p 
            className={`text-white/90 mb-7 sm:mb-8 leading-relaxed ${hasHeroImage ? 'mx-0 max-w-[58ch] lg:max-w-[56ch]' : 'mx-auto max-w-[62ch]'}`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.9vw, 1.5rem)',
            }}
          >
            {subheadline || 'We provide exceptional services tailored to your needs.'}
          </p>

          {/* SLDS Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${hasHeroImage ? 'justify-center lg:justify-start items-center lg:items-start' : 'justify-center items-center'}`}>
            {cta && (
              <a
                href={cta.link || '#contact'}
                className="slds-button slds-button_brand px-7 py-3 text-base md:text-lg"
                style={{ 
                  backgroundColor: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                  borderRadius: 'var(--radius-medium)'
                }}
              >
                {cta.text || 'Get Started'}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
            <a
              href="#features"
              className="slds-button slds-button_outline-brand px-7 py-3 text-base md:text-lg border-2 border-white/30 text-white hover:bg-white/10"
              style={{ borderRadius: 'var(--radius-medium)' }}
            >
              Learn More
            </a>
          </div>

          </div>

          {hasHeroImage && (
            <div className="mx-auto w-full rounded-2xl border border-white/20 bg-white/8 p-2.5 sm:p-3 shadow-2xl backdrop-blur-sm" style={{ maxWidth: '40rem' }}>
              <img
                src={imageUrl}
                alt={imageAlt || 'Hero visual'}
                className="h-auto w-full rounded-xl object-contain"
                style={{ objectPosition: imagePosition || 'center' }}
              />
            </div>
          )}

          {/* SLDS Trust Indicators */}
          <div className={`mt-8 sm:mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-white/80 text-sm ${hasHeroImage ? 'justify-center lg:justify-start lg:col-span-2' : 'justify-center'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Powered by AI</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SLDS 2 Design System</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
