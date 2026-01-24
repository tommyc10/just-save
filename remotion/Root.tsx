import { Composition } from 'remotion';
import { LaunchVideo } from './compositions/LaunchVideo';

// Total duration calculation:
// Hero (150) + Features (180) + Stats (120) + Closing (120) = 570 frames
// Minus 3 transitions × 20 frames = 60 frames overlap
// Total = 570 - 60 = 510 frames (~17 seconds at 30fps)

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={510}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
