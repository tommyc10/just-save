import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { HeroScene } from '../scenes/HeroScene';
import { FeatureShowcase } from '../scenes/FeatureShowcase';
import { StatsReveal } from '../scenes/StatsReveal';
import { ClosingScene } from '../scenes/ClosingScene';

// Scene durations in frames (30 fps)
const HERO_DURATION = 150; // 5 seconds
const FEATURES_DURATION = 180; // 6 seconds
const STATS_DURATION = 120; // 4 seconds
const CLOSING_DURATION = 120; // 4 seconds
const TRANSITION_DURATION = 20; // ~0.66 seconds

export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FAFAFA' }}>
      <TransitionSeries>
        {/* Scene 1: Hero Intro */}
        <TransitionSeries.Sequence durationInFrames={HERO_DURATION}>
          <HeroScene />
        </TransitionSeries.Sequence>

        {/* Fade transition */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Feature Showcase */}
        <TransitionSeries.Sequence durationInFrames={FEATURES_DURATION}>
          <FeatureShowcase />
        </TransitionSeries.Sequence>

        {/* Fade transition */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Stats Reveal */}
        <TransitionSeries.Sequence durationInFrames={STATS_DURATION}>
          <StatsReveal />
        </TransitionSeries.Sequence>

        {/* Fade transition */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Closing CTA */}
        <TransitionSeries.Sequence durationInFrames={CLOSING_DURATION}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
