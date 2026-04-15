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
  const features = content?.features || content?.items || [];
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
      <div className="slds-container">
        {/* SLDS Section Header */}
        <div className="text-center mb-16">
          <span className="slds-badge slds-badge_lightest mb-4">Features</span>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--slds-g-color-neutral-base-90)'
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
        <div className="slds-grid slds-grid--4-col items-stretch">
          {features.map((feature, index) => (
            <div
              key={index}
              className="slds-card group relative"
            >
              {/* Human-AI Collaboration: Edit Button */}
              {onContentUpdate && editingIndex !== index && (
                <button
                  onClick={() => handleEdit(index, feature)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit this feature (Human-AI Collaboration)"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              )}

              <div className="slds-card__body p-6">
                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {getIcon(feature.icon)}
                </div>

                {editingIndex === index ? (
                  /* Editing Mode */
                  <div className="space-y-3">
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
                      className="text-lg font-semibold mb-2"
                      style={{ 
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--slds-g-color-neutral-base-90)'
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: 'var(--slds-g-color-neutral-base-70)'
                      }}
                    >
                      {feature.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
