import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const analyzeBrand = async (data) => {
  const response = await axios.post(`${API_BASE}/brand/analyze`, data);
  return response.data;
};

export const generateDesign = async (brandDNA) => {
  const response = await axios.post(`${API_BASE}/design/generate`, { brandDNA });
  return response.data;
};

export const generateContent = async (sectionType, businessName, brandDNA) => {
  const response = await axios.post(`${API_BASE}/content/generate`, {
    sectionType,
    businessName,
    brandDNA
  });
  return response.data;
};

// Main website generation function
export const generateWebsite = async ({ businessName, description, tone, audience, heroImageMode }) => {
  const response = await axios.post(`${API_BASE}/website/generate`, {
    businessName,
    description,
    tone,
    audience,
    heroImageMode
  });
  return response.data;
};

// Legacy function name for backwards compatibility
export const generateFullWebsite = async (businessName, description, tone, audience) => {
  return generateWebsite({ businessName, description, tone, audience });
};
