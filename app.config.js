export default ({ config }) => {
  return {
    ...config, // keep everything from app.json
    extra: {
      ...config.extra, // preserve existing extra if any
      EXPO_PUBLIC_API_GATEWAY_URL: process.env.EXPO_PUBLIC_API_GATEWAY_URL,
    },
  };
};
