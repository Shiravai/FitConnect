const baseConfig = require("./app.json");

module.exports = ({ config }) => {
  const merged = { ...config, ...baseConfig.expo };

  if (process.env.API_URL) {
    merged.extra = { ...merged.extra, apiUrl: process.env.API_URL };
  }

  return merged;
};
