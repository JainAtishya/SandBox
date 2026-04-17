import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Menu({ content, variant = 'list' }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const { title, description, items } = content || {};
  const displayItems = Array.isArray(items) && items.length > 0 ? items : [
    { name: 'Signature Service', price: '$49', description: 'Our most popular offering, crafted with care.', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80' },
    { name: 'Premium Package', price: '$99', description: 'Everything you need for a complete experience.', imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200&q=80' },
    { name: 'Essential Add-on', price: '$19', description: 'The perfect complement to your primary choice.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' },
  ];

  return (
    <section
      className="slds-section bg-white overflow-hidden !pt-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12 max-w-3xl mx-auto px-4">
          <h2 className="!text-center !text-3xl sm:!text-4xl md:!text-5xl !font-bold text-slate-900 mb-6 w-full" style={{ fontFamily: 'var(--font-heading)' }}>
            {title || 'Our Menu & Pricing'}
          </h2>
          <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full mb-6 opacity-80"></div>
          {description && (
            <p className="!text-center !text-lg sm:!text-xl text-slate-600 max-w-2xl mx-auto w-full" style={{ fontFamily: 'var(--font-body)' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="relative w-full py-4 group/menu max-w-7xl mx-auto">
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white transition-opacity opacity-0 group-hover/menu:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white transition-opacity opacity-0 group-hover/menu:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex w-full items-stretch overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 pb-12 hide-scrollbar scroll-smooth"
        >
          {displayItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-4 p-4 sm:p-5 w-[70vw] max-w-[240px] sm:max-w-[280px] rounded-xl bg-slate-50 border border-slate-100 shadow-sm shrink-0 snap-center h-auto">        
              {item.imageUrl && (
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-baseline border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.name}
                  </h3>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {item.price}
                  </span>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}