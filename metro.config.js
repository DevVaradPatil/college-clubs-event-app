const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Remove 'svg' from assetExts and add to sourceExts, also add 'cjs'
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg", "cjs"];

// Optionally set package exports flag
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
