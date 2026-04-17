import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery({ content, variant = 'grid' }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const { title, subtitle, images } = content || {};
  const displayImages = Array.isArray(images) && images.length > 0 ? images : [
    { url: 'https://images.unsplash.com/photo-1542314831-c6a4d14fa0c5?auto=format&fit=crop&w=600&q=80', caption: 'Atmosphere' },
    { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80', caption: 'Quality' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', caption: 'Experience' },
  ];

  return (
    <section
      className="slds-section bg-[var(--color-neutral-50)] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12 max-w-3xl mx-auto px-4">
          <h2 className="!text-center !text-3xl sm:!text-4xl md:!text-5xl !font-bold text-slate-900 mb-6 w-full" style={{ fontFamily: 'var(--font-heading)' }}>
            {title || 'Our Gallery'}
          </h2>
          <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full mb-6 opacity-80"></div>
          {subtitle && (
            <p className="!text-center !text-lg sm:!text-xl text-slate-600 max-w-2xl mx-auto w-full" style={{ fontFamily: 'var(--font-body)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="relative w-full group/gallery max-w-7xl mx-auto">
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white transition-opacity opacity-0 group-hover/gallery:opacity-100 disabled:opacity-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white transition-opacity opacity-0 group-hover/gallery:opacity-100 disabled:opacity-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex w-full items-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 pb-12 hide-scrollbar scroll-smooth"
        >
          {displayImages.map((img, i) => (
            <div key={i} className="group/item relative overflow-hidden rounded-2xl w-[60vw] max-w-[220px] sm:max-w-[280px] shrink-0 bg-slate-200 shadow-sm snap-center">
              <img
                src={img.url}
                alt={img.caption || `Gallery image ${i+1}`}
                className="w-full h-auto block transition-transform duration-500 group-hover/item:scale-105"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white font-medium">
                    {img.caption}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}