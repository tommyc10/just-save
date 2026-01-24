import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily: interFont } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

const stats = [
  { value: 90, unit: 'sec', label: 'Average analysis time', color: '#007AFF' },
  { value: 0, unit: 'KB', label: 'Data stored on servers', color: '#34C759' },
  { value: 100, unit: '%', label: 'Privacy guaranteed', color: '#5856D6' },
];

export const StatsReveal: React.FC = () => {
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
        background: '#000000',
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(88, 86, 214, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

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
        {/* Title */}
        <h2
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: interFont,
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#F5F5F7',
            marginBottom: 100,
            textAlign: 'center',
          }}
        >
          Built for{' '}
          <span style={{ color: '#007AFF' }}>speed</span>
          {' '}and{' '}
          <span style={{ color: '#34C759' }}>privacy</span>
        </h2>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 80,
            maxWidth: 1400,
            width: '100%',
          }}
        >
          {stats.map((stat, index) => {
            const staggerDelay = 15 + index * 12;
            const statProgress = spring({
              frame: frame - staggerDelay,
              fps,
              config: smoothSpring,
            });
            const statOpacity = interpolate(statProgress, [0, 1], [0, 1]);
            const statY = interpolate(statProgress, [0, 1], [40, 0]);

            // Animate number counting
            const countProgress = interpolate(statProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
            const displayValue = Math.floor(countProgress * stat.value);

            // Progress bar animation
            const barProgress = interpolate(statProgress, [0.3, 1], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={index}
                style={{
                  opacity: statOpacity,
                  transform: `translateY(${statY}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {/* Number */}
                <div
                  style={{
                    fontFamily: interFont,
                    fontSize: 120,
                    fontWeight: 700,
                    color: '#F5F5F7',
                    lineHeight: 1,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    letterSpacing: '-0.03em',
                  }}
                >
                  <span>{displayValue}</span>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 500,
                      color: stat.color,
                    }}
                  >
                    {stat.unit}
                  </span>
                </div>

                {/* Label */}
                <p
                  style={{
                    fontFamily: interFont,
                    fontSize: 17,
                    fontWeight: 400,
                    color: '#86868B',
                    margin: 0,
                    marginBottom: 24,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.label}
                </p>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${barProgress * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
