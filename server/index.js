require('dotenv').config();
const express = require('express');
const cors = require('cors');
const websiteRoutes = require('./routes/website');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/website', websiteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BrandAI Server Running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 BrandAI Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
