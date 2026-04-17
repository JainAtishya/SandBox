import { useState } from 'react';
import { 
  Shield, Star, Clock, Heart, Users, Leaf, 
  Zap, Award, Target, Sparkles, CheckCircle, TrendingUp,
  Edit3, Check, X
} from 'lucide-react';

const iconMap = {
  shield: Shield,
  star: Star,
  clock: Clock,
  heart: Heart,
  users: Users,
  leaf: Leaf,
  zap: Zap,
  award: Award,
  target: Target,
  sparkles: Sparkles,
  check: CheckCircle,
  trending: TrendingUp,
};

export default function Features({ content, variant = 'grid', onContentUpdate }) {
  const { title } = content || {};
  // Support both 'features' and 'items' field names
  const featuresSource = content?.features || content?.items || [];
  const features = Array.isArray(featuresSource)
    ? featuresSource
    : [];
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedFeature, setEditedFeature] = useState(null);

  const getIcon = (iconName) => {
    const normalizedName = iconName?.toLowerCase().replace(/[^a-z]/g, '');
    const IconComponent = iconMap[normalizedName] || Star;
    return <IconComponent className="w-6 h-6" />;
  };

  const handleEdit = (index, feature) => {
    setEditingIndex(index);
    setEditedFeature({ ...feature });
  };

  const handleSave = (index) => {
    if (onContentUpdate && editedFeature) {
      const updatedFeatures = [...features];
      updatedFeatures[index] = editedFeature;
      onContentUpdate({ ...content, features: updatedFeatures, items: updatedFeatures });
    }
    setEditingIndex(null);
    setEditedFeature(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedFeature(null);
  };

  return (
    <section 
      className="slds-section bg-white"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SLDS Section Header */}
        <div className="text-center mb-16">
          <span className="slds-badge slds-badge_lightest mb-4">Features</span>
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--slds-g-color-neutral-base-90)',
              fontSize: 'clamp(1.875rem, 5vw, 2.25rem)',
              lineHeight: 1.2
            }}
          >
            {title || 'Why Choose Us'}
          </h2>
          <div 
            className="w-20 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        </div>

        {/* SLDS Grid with Cards */}
        <div 
          className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{ gridAutoRows: '1fr' }}
        >
          {features.map((feature, index) => {
            const safeFeature = feature && typeof feature === 'object'
              ? feature
              : { title: `Feature ${index + 1}`, description: String(feature || '') };
            return (
            <div
              key={index}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-neutral-500) 22%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-neutral-100) 62%, white)',
              }}
            >
              {/* Human-AI Collaboration: Edit Button */}
              {onContentUpdate && editingIndex !== index && (
                <button
                  onClick={() => handleEdit(index, feature)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Edit this feature (Human-AI Collaboration)"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                {/* Icon */}
                <div 
                  className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {getIcon(safeFeature.icon)}
                </div>

                {editingIndex === index ? (
                  /* Editing Mode */
                  <div className="space-y-3 flex-1">
                    <input
                      type="text"
                        value={editedFeature?.title || ''}
                        onChange={(e) => setEditedFeature({ ...editedFeature, title: e.target.value })}
                      className="slds-input text-lg font-semibold"
                      placeholder="Feature title"
                    />
                    <textarea
                        value={editedFeature?.description || ''}
                        onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
                      className="slds-input text-sm h-20 resize-none"
                      placeholder="Feature description"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(index)}
                        className="slds-button slds-button_brand flex-1"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="slds-button slds-button_neutral"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    <h3 
                      className="mb-2 font-semibold leading-snug"
                      style={{ 
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-neutral-900)',
                        fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                        lineHeight: 1.35,
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        display: '-webkit-box'
                      }}
                    >
                        {safeFeature.title || `Feature ${index + 1}`}
                      </h3>
                      <p 
                      className="grow leading-relaxed"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-neutral-700)',
                        fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                        lineHeight: 1.6
                      }}
                    >
                        {safeFeature.description || ''}
                      </p>
                    </>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
