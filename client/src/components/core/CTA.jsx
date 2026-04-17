import { ArrowRight } from 'lucide-react';

export default function CTA({ content, variant = 'centered' }) {
  const { headline, supportingText, cta } = content || {};

  return (
    <section 
      className="slds-section relative overflow-hidden block m-0 w-full"
      style={{
        background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)`
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 
          className="font-bold text-white mb-6"
          style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.875rem, 5vw, 3rem)',
            lineHeight: 1.2
          }}
        >
          {headline || 'Ready to Get Started?'}
        </h2>

        {/* Supporting Text */}
        <p 
          className="text-white/90 mb-10 mx-auto max-w-3xl"
          style={{ 
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.6
          }}
        >
          {supportingText || 'Join thousands of satisfied customers who have transformed their experience with us.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap mt-12">
          <a
            href={cta?.link || '#contact'}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            
            style={{ 
              backgroundColor: 'white',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-medium)'
            }}
          >
            {cta?.text || 'Get Started Now'}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl transition-all border-2 border-white/30 text-white hover:bg-white/10"
            style={{ 
              borderRadius: 'var(--radius-medium)',
              fontSize: 'clamp(0.875rem, 1vw, 1rem)'
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
