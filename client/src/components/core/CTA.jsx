import { ArrowRight } from 'lucide-react';

export default function CTA({ content, variant = 'centered' }) {
  const { headline, supportingText, cta } = content || {};

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        paddingTop: 'var(--spacing-section)', 
        paddingBottom: 'var(--spacing-section)',
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

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {headline || 'Ready to Get Started?'}
        </h2>

        {/* Supporting Text */}
        <p 
          className="text-lg text-white/90 mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {supportingText || 'Join thousands of satisfied customers who have transformed their experience with us.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={cta?.link || '#contact'}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
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
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all border-2 border-white/30 text-white hover:bg-white/10"
            style={{ borderRadius: 'var(--radius-medium)' }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
