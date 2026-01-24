# Demo Video - Just Save

A professional Apple-grade demo video for the Just Save spending analyzer app, built with Remotion.

## Video Structure (~17 seconds)

- **Hero Scene** (0-5s): Clean gradient background with staggered text animations
- **Feature Showcase** (5-11s): Four features in a 2x2 grid with subtle card reveals
- **Stats Reveal** (11-15s): Dark mode section with animated number counters
- **Closing Scene** (15-17s): Logo, branding, and call-to-action

## Design System

The video follows Apple's design principles:
- **Typography**: Inter font (clean, modern sans-serif)
- **Colors**: Apple system colors (#007AFF blue, #5856D6 purple, #34C759 green, #FF9500 orange)
- **Animations**: Smooth spring animations with high damping (`{ damping: 200 }`) for no-bounce reveals
- **Transitions**: Subtle 0.66s fade transitions between scenes

## Commands

```bash
# Open Remotion Studio (visual editor)
npm run video:studio

# Render the final video (1080p MP4)
npm run video:render

# Preview the video
npm run video:preview
```

## Output

The rendered video will be saved to: `out/launch-video.mp4`

## File Structure

```
remotion/
├── index.ts                    # Entry point
├── Root.tsx                    # Composition registration
├── compositions/
│   └── LaunchVideo.tsx         # Main video with transitions
└── scenes/
    ├── HeroScene.tsx           # Opening title
    ├── FeatureShowcase.tsx     # Feature cards grid
    ├── StatsReveal.tsx         # Statistics on dark background
    └── ClosingScene.tsx        # CTA and branding
```

## Customization

### Adjust Duration
Edit `remotion/Root.tsx` - change `durationInFrames` (30 fps = 1 second per 30 frames)

### Modify Scenes
Each scene in `scenes/` can be edited independently. Animations use `useCurrentFrame()` and `spring()`.

### Animation Tips
1. Use `spring({ frame, fps, config: { damping: 200 } })` for smooth reveals
2. Stagger with `frame - index * delay` for sequential animations
3. Use `interpolate()` to map spring output to CSS values

## Built With

- [Remotion](https://remotion.dev) - Video creation in React
- [@remotion/transitions](https://remotion.dev/docs/transitions) - Scene transitions
- [@remotion/google-fonts](https://remotion.dev/docs/google-fonts) - Inter font
