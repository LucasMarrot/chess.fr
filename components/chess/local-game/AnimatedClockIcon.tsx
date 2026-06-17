import { View } from 'tamagui';
import Svg, { Circle, Path } from 'react-native-svg';

type AnimatedClockIconProps = {
  isActive: boolean;
  fillRatio: number;
  color: string;
  needleColor: string;
  size?: number;
  strokeWidth?: number;
};

export const AnimatedClockIcon = ({
  isActive,
  fillRatio,
  color,
  needleColor,
  size = 22,
  strokeWidth = 2.2,
}: AnimatedClockIconProps) => {
  const ratio = Math.max(0, Math.min(1, fillRatio));
  const canvasSize = 100;
  const center = 50;
  const ringRadius = 40;
  const ringStrokeWidth = strokeWidth * 3.2 + 10;
  const trackOpacity = isActive ? 0.26 : 0.2;
  const progressOpacity = 1;
  const startAngle = -90;
  const elapsedRatio = 1 - ratio;
  const sweepAngle = ratio * 360;
  const arcStartAngle = startAngle + elapsedRatio * 360;

  const toCartesian = (angle: number, radius: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const buildArcPath = (angle: number, fromAngle: number) => {
    if (angle <= 0) return '';
    if (angle >= 359.999) {
      return `M ${center} ${center - ringRadius} a ${ringRadius} ${ringRadius} 0 1 1 0 ${
        2 * ringRadius
      } a ${ringRadius} ${ringRadius} 0 1 1 0 -${2 * ringRadius}`;
    }

    const start = toCartesian(fromAngle, ringRadius);
    const end = toCartesian(fromAngle + angle, ringRadius);
    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${ringRadius} ${ringRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const progressPath = buildArcPath(sweepAngle, arcStartAngle);

  return (
    <View opacity={1}>
      <Svg width={size} height={size} viewBox={`0 0 ${canvasSize} ${canvasSize}`}>
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          fill="none"
          stroke={color}
          strokeWidth={ringStrokeWidth}
          strokeOpacity={trackOpacity}
        />
        {progressPath ? (
          <Path
            d={progressPath}
            fill="none"
            stroke={needleColor}
            strokeWidth={ringStrokeWidth}
            strokeLinecap="round"
            strokeOpacity={progressOpacity}
          />
        ) : null}
      </Svg>
    </View>
  );
};
