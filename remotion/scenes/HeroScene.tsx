import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily: interFont } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth, Apple-style spring config
  const smoothSpring = { damping: 200 };
  const gentleSpring = { damping: 100, stiffness: 80 };

  // Badge animation
  const badgeProgress = spring({
    frame,
    fps,
    config: smoothSpring,
  });
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [20, 0]);

  // Main title animation - staggered
  const titleProgress = spring({
    frame: frame - 8,
    fps,
    config: smoothSpring,
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  // Accent word animation
  const accentProgress = spring({
    frame: frame - 16,
    fps,
    config: gentleSpring,
  });
  const accentOpacity = interpolate(accentProgress, [0, 1], [0, 1]);
  const accentY = interpolate(accentProgress, [0, 1], [30, 0]);

  // Subtitle animation
  const subtitleProgress = spring({
    frame: frame - 28,
    fps,
    config: smoothSpring,
  });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);

  // Subtle gradient animation
  const gradientShift = interpolate(frame, [0, 120], [0, 10], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)',
      }}
    >
      {/* Subtle top gradient accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '60%',
          background: `radial-gradient(ellipse 80% 50% at 50% ${-20 + gradientShift}%, rgba(0, 122, 255, 0.04) 0%, transparent 70%)`,
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
          padding: '0 160px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            marginBottom: 32,
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 122, 255, 0.08)',
            borderRadius: 100,
            fontFamily: interFont,
            fontSize: 14,
            fontWeight: 500,
            color: '#007AFF',
            letterSpacing: '0.02em',
          }}
        >
          AI-Powered Financial Insights
        </div>

        {/* Main title */}
        <h1
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: interFont,
            fontSize: 96,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: '#1D1D1F',
            textAlign: 'center',
            margin: 0,
            marginBottom: 16,
          }}
        >
          Find your
        </h1>

        {/* Accent line */}
        <h1
          style={{
            opacity: accentOpacity,
            transform: `translateY(${accentY}px)`,
            fontFamily: interFont,
            fontSize: 96,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            margin: 0,
            marginBottom: 48,
          }}
        >
          forgotten subscriptions.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontFamily: interFont,
            fontSize: 24,
            fontWeight: 400,
            color: '#86868B',
            textAlign: 'center',
            margin: 0,
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          Analyze your spending in under 90 seconds.
          <br />
          Privacy-first. AI-powered. Brutally honest.
        </p>
      </AbsoluteFill>

      {/* Subtle bottom gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(0deg, rgba(245, 245, 247, 1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
