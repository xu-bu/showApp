// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure platform-specific files are recognized
config.resolver.sourceExts = [
  ...config.resolver.sourceExts.filter(ext => ext !== "svg"),
  "android.js",
  "ios.js",
];

module.exports = config;
