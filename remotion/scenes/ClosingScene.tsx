import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily: interFont } = loadFont('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smoothSpring = { damping: 200 };
  const gentleSpring = { damping: 100, stiffness: 80 };

  // Logo animation
  const logoProgress = spring({
    frame,
    fps,
    config: gentleSpring,
  });
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);

  // Title animation
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: smoothSpring,
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // Tagline animation
  const taglineProgress = spring({
    frame: frame - 20,
    fps,
    config: smoothSpring,
  });
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);
  const taglineY = interpolate(taglineProgress, [0, 1], [20, 0]);

  // CTA Button animation
  const ctaProgress = spring({
    frame: frame - 32,
    fps,
    config: smoothSpring,
  });
  const ctaOpacity = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaProgress, [0, 1], [30, 0]);

  // URL animation
  const urlProgress = spring({
    frame: frame - 45,
    fps,
    config: smoothSpring,
  });
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)',
      }}
    >
      {/* Subtle gradient accents */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '60%',
          background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(0, 122, 255, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '40%',
          background: 'radial-gradient(ellipse 60% 50% at 50% 70%, rgba(88, 86, 214, 0.03) 0%, transparent 70%)',
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
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 10px 40px rgba(0, 122, 255, 0.2)',
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        {/* App name */}
        <h1
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: interFont,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#1D1D1F',
            margin: 0,
            marginBottom: 24,
          }}
        >
          Just Save
        </h1>

        {/* Tagline */}
        <p
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: interFont,
            fontSize: 24,
            fontWeight: 400,
            color: '#86868B',
            textAlign: 'center',
            margin: 0,
            marginBottom: 60,
            maxWidth: 500,
            lineHeight: 1.5,
          }}
        >
          Stop paying for subscriptions you forgot about.
          <br />
          <span style={{ color: '#1D1D1F', fontWeight: 500 }}>
            Start saving in 90 seconds.
          </span>
        </p>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              backgroundColor: '#1D1D1F',
              color: '#FFFFFF',
              padding: '20px 48px',
              borderRadius: 14,
              fontFamily: interFont,
              fontSize: 20,
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              letterSpacing: '0.01em',
            }}
          >
            Get Started — It's Free
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: interFont,
            fontSize: 16,
            fontWeight: 500,
            color: '#007AFF',
            letterSpacing: '0.02em',
          }}
        >
          justsave.app
        </div>
      </AbsoluteFill>

      {/* Bottom subtle line */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 40,
          height: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          opacity: urlOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
