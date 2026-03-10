const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { transformer, resolver } = config;
  let svgTransformerPath = null;

  try {
    svgTransformerPath = require.resolve("react-native-svg-transformer");
  } catch {
    // Keep Metro bootable even if dev dependencies are not installed.
    svgTransformerPath = null;
  }

  config.transformer = {
    ...transformer,
    ...(svgTransformerPath ? { babelTransformerPath: svgTransformerPath } : {}),
  };
  if (svgTransformerPath) {
    config.resolver = {
      ...resolver,
      assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...resolver.sourceExts, "svg"],
    };
  }

  return config;
})();
