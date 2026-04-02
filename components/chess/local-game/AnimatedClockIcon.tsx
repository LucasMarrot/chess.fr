import { useEffect, useMemo, useState } from 'react';

import {
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
} from 'lucide-react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type AnimatedClockIconProps = {
  isActive: boolean;
  color: string;
  size?: number;
  strokeWidth?: number;
};

const CLOCK_ICONS = [
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
] as const;

export const AnimatedClockIcon = ({
  isActive,
  color,
  size = 22,
  strokeWidth = 2.2,
}: AnimatedClockIconProps) => {
  const progress = useSharedValue(0);
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    if (isActive) {
      progress.value = withRepeat(
        withTiming(12, {
          duration: 12000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
      return;
    }

    cancelAnimation(progress);
    progress.value = 0;
    setIconIndex(0);
  }, [isActive, progress]);

  useAnimatedReaction(
    () => Math.floor(progress.value) % 12,
    (next, prev) => {
      if (next !== prev) {
        runOnJS(setIconIndex)(next);
      }
    },
    [],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = progress.value * 30;
    return {
      transform: [{ rotate: `${rotation}deg` }],
      opacity: isActive ? 1 : 0.85,
    };
  }, [isActive]);

  const ClockIcon = useMemo(() => CLOCK_ICONS[iconIndex], [iconIndex]);

  return (
    <Animated.View style={animatedStyle}>
      <ClockIcon color={color} size={size} strokeWidth={strokeWidth} />
    </Animated.View>
  );
};
