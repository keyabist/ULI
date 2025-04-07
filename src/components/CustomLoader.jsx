/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';

const move = keyframes`
  0% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
`;

const wrapperStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full screen center */
  
`;

const pathStyle = css`
  width: 280px; /* Increased width */
  height: 160px; /* Increased height */
  position: relative;
`;

const cometDot = (delay, size, opacity) => css`
  width: ${size}px;
  height: ${size}px;
  background: #00ff00;
  border-radius: 50%;
  position: absolute;
  offset-path: path("M 140 80 C 40 0, 40 160, 140 80 C 240 0, 240 160, 140 80");
  animation: ${move} 2.5s linear infinite;
  animation-delay: ${delay}s;
  offset-rotate: 0deg;
  opacity: ${opacity};
  filter: drop-shadow(0 0 8px rgba(0, 255, 0, ${opacity}));
`;

const CustomLoader = () => {
  const trail = [
    { delay: 0, size: 12, opacity: 1 },
    { delay: 0.05, size: 10, opacity: 0.6 },
    { delay: 0.1, size: 8, opacity: 0.4 },
    { delay: 0.15, size: 6, opacity: 0.25 },
    { delay: 0.2, size: 5, opacity: 0.1 },
  ];

  return (
    <div css={wrapperStyle}>
      <div css={pathStyle}>
        {trail.map((dot, index) => (
          <div key={index} css={cometDot(dot.delay, dot.size, dot.opacity)} />
        ))}
      </div>
    </div>
  );
};

export default CustomLoader;
