import React from 'react';
import Svg, {Path, Circle, Rect, G} from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

// Infinity symbol for Auto - cleaner single path
export const InfinityIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.1 8C20.2 8 22 9.8 22 12C22 14.2 20.2 16 18.1 16C16.7 16 15.5 15.3 14.7 14.3L12 11L9.3 14.3C8.5 15.3 7.3 16 5.9 16C3.8 16 2 14.2 2 12C2 9.8 3.8 8 5.9 8C7.3 8 8.5 8.7 9.3 9.7L12 13L14.7 9.7C15.5 8.7 16.7 8 18.1 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// Clean nested triangles for Chat
export const NestedTrianglesIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      {/* Outer triangle */}
      <Path
        d="M12 2L22 20H2L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner triangle */}
      <Path
        d="M12 9L16.5 17H7.5L12 9Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
        fill="none"
      />
    </G>
  </Svg>
);

// Simplified neural network for Memory
export const MemoryNodesIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      {/* Center node */}
      <Circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="2" fill="none" />

      {/* Surrounding nodes */}
      <Circle cx="12" cy="5" r="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="5" cy="12" r="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="19" cy="12" r="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="12" cy="19" r="1.5" stroke={color} strokeWidth="1.5" fill="none" />

      {/* Clean connection lines */}
      <Path
        d="M12 9.5V6.5M12 14.5V17.5M9.5 12H6.5M14.5 12H17.5"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

// Clean overlapping squares for Share
export const OffsetSquaresIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      {/* Back square */}
      <Rect
        x="4"
        y="4"
        width="11"
        height="11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Front square */}
      <Rect
        x="9"
        y="9"
        width="11"
        height="11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={`${color}15`}
      />
    </G>
  </Svg>
);

// Minimalist settings gear
export const FlowerIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      {/* Simplified gear shape */}
      <Path
        d="M12 2L14.5 4.5L18 4L19 8L22 10V14L19 16L18 20L14.5 19.5L12 22L9.5 19.5L6 20L5 16L2 14V10L5 8L6 4L9.5 4.5L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center circle */}
      <Circle
        cx="12"
        cy="12"
        r="3.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </G>
  </Svg>
);