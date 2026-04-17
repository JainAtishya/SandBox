import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact({ content }) {
  const {
    title,
    description,
    email,
    phone,
    address,
    buttonText,
    buttonLink
  } = content || {};

  return (
    <section
      className="slds-section"
      style={{
        backgroundColor: 'var(--color-neutral-100)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-neutral-900)',
              fontSize: 'clamp(1.875rem, 5vw, 2.5rem)',
              lineHeight: 1.2
            }}
          >
            {title || 'Contact Us'}
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-neutral-700)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              lineHeight: 1.6
            }}
          >
            {description || 'Have questions or want to get started? Reach out and our team will respond soon.'}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={<Phone className="h-5 w-5 text-white" />}
            label="Phone"
            value={phone || '+1 (555) 123-4567'}
          />
          <InfoCard
            icon={<Mail className="h-5 w-5 text-white" />}
            label="Email"
            value={email || 'hello@yourbusiness.com'}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-white" />}
            label="Address"
            value={address || '123 Main Street, Your City'}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href={buttonLink || '#'}
            className="inline-flex items-center justify-center rounded-lg px-7 py-3 font-semibold text-white transition hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {buttonText || 'Send Message'}
          </a>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div
      className="h-full rounded-xl border p-5"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-neutral-500) 24%, transparent)',
        backgroundColor: 'white'
      }}
    >
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {icon}
      </div>
      <p
        className="mb-1 text-sm font-semibold"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-neutral-900)'
        }}
      >
        {label}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-neutral-700)'
        }}
      >
        {value}
      </p>
    </div>
  );
}