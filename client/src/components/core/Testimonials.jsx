import { Quote } from 'lucide-react';

export default function Testimonials({ content, variant = 'grid' }) {
  const { title, testimonials } = content || {};

  return (
    <section 
      style={{ 
        paddingTop: 'var(--spacing-section)', 
        paddingBottom: 'var(--spacing-section)',
        backgroundColor: 'var(--color-neutral-100)'
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-neutral-900)'
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
        <div className="grid md:grid-cols-3 gap-8">
          {(testimonials || []).map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow relative"
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
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {testimonial.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <div 
                    className="font-semibold"
                    style={{ 
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-neutral-900)'
                    }}
                  >
                    {testimonial.author}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--color-neutral-500)' }}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
