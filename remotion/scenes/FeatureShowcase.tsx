import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily: interFont } = loadFont('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    title: 'Smart Parsing',
    description: 'Upload CSV or PDF bank statements',
    color: '#007AFF',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    title: 'Auto-Detection',
    description: 'AI identifies recurring subscriptions',
    color: '#5856D6',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'AI Insights',
    description: 'Personalized spending recommendations',
    color: '#34C759',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Privacy First',
    description: 'Zero data storage. Ever.',
    color: '#FF9500',
  },
];

export const FeatureShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smoothSpring = { damping: 200 };

  // Title animation
  const titleProgress = spring({
    frame,
    fps,
    config: smoothSpring,
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 50%, #F5F5F7 100%)',
      }}
    >
      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 120px',
        }}
      >
        {/* Section header */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            marginBottom: 80,
          }}
        >
          <h2
            style={{
              fontFamily: interFont,
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: '#1D1D1F',
              margin: 0,
              marginBottom: 16,
            }}
          >
            Everything you need.
          </h2>
          <p
            style={{
              fontFamily: interFont,
              fontSize: 24,
              fontWeight: 400,
              color: '#86868B',
              margin: 0,
            }}
          >
            Nothing you don't.
          </p>
        </div>

        {/* Feature grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 32,
            maxWidth: 1200,
            width: '100%',
          }}
        >
          {features.map((feature, index) => {
            const staggerDelay = 15 + index * 8;
            const cardProgress = spring({
              frame: frame - staggerDelay,
              fps,
              config: smoothSpring,
            });
            const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);
            const cardY = interpolate(cardProgress, [0, 1], [40, 0]);
            const cardScale = interpolate(cardProgress, [0, 1], [0.95, 1]);

            return (
              <div
                key={index}
                style={{
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 24,
                  padding: 40,
                  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 24,
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: `${feature.color}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feature.color,
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>

                {/* Text */}
                <div>
                  <h3
                    style={{
                      fontFamily: interFont,
                      fontSize: 24,
                      fontWeight: 600,
                      color: '#1D1D1F',
                      margin: 0,
                      marginBottom: 8,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: interFont,
                      fontSize: 17,
                      fontWeight: 400,
                      color: '#86868B',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
