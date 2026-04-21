const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add alias for @ to point to src and also allow assets
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;