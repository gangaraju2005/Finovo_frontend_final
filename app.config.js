export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      // Provide a fallback to the ALB URL so the APK always has a valid endpoint
      // even if the environment variable fails to inject during the build.
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://Finovo-alb-341562210.ap-south-1.elb.amazonaws.com/api',
      mediaUrl: process.env.EXPO_PUBLIC_MEDIA_URL || 'http://Finovo-alb-341562210.ap-south-1.elb.amazonaws.com'
    }
  };
};
