// Utility functions for MotivationalBanner

/**
 * Get greeting based on time of day (Hebrew)
 */
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "בוקר טוב";
  }
  if (hour >= 12 && hour < 17) {
    return "צהריים טובים";
  }
  if (hour >= 17 && hour < 21) {
    return "ערב טוב";
  }
  return "לילה טוב";
};

/**
 * Generate consistent random index based on string + date
 * Returns the same index for the same seed on the same day
 */
export const getDailyIndex = (seed: string, arrayLength: number): number => {
  const today = new Date().toDateString();
  const combined = seed + today;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
};

/**
 * CSS animations for the banner
 */
export const bannerAnimationStyles = `
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    50% { transform: rotate(-10deg); }
    75% { transform: rotate(20deg); }
  }
  .animate-wave {
    display: inline-block;
    animation: wave 1.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }
`;
