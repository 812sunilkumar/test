module.exports = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Disable Next.js dev indicator
  devIndicators: {
    buildActivity: false,
  },
};
