import { Quote } from 'lucide-react';

export default function Testimonials({ content, variant = 'grid' }) {
  const { title, testimonials } = content || {};
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

  return (
    <section 
      className="slds-section"
      style={{
        backgroundColor: 'var(--color-neutral-100)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-neutral-900)',
              fontSize: 'clamp(1.875rem, 5vw, 2.25rem)',
              lineHeight: 1.2
            }}
          >
            {title || 'What Our Customers Say'}
          </h2>
          <div 
            className="w-20 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          />
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 auto-rows-max">
          {safeTestimonials.map((testimonial, index) => {
            const safeItem = testimonial && typeof testimonial === 'object'
              ? testimonial
              : { quote: String(testimonial || ''), author: `Customer ${index + 1}`, role: 'Customer' };
            return (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow relative h-full"
              style={{ borderRadius: 'var(--radius-large)' }}
            >
              {/* Quote Icon */}
              <div 
                className="absolute -top-4 left-8 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Quote Text */}
              <p 
                className="text-base leading-relaxed mb-6 pt-4"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-neutral-700)'
                }}
                >
                  "{safeItem.quote || 'Great experience and excellent service.'}"
                </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                   {safeItem.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <div 
                    className="font-semibold"
                    style={{ 
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-neutral-900)'
                    }}
                  >
                    {safeItem.author || `Customer ${index + 1}`}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--color-neutral-500)' }}
                  >
                    {safeItem.role || 'Customer'}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
