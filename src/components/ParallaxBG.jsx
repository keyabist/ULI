import React from 'react';
import CandlestickBackground from './Candlestick';
import Squares from './GridLayer';

import '../styles/ParallaxBG.css';

const ParallaxBackground = () => {
  return (
    <div className="parallax-container">
      <div className="fullscreen-bg">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#00ff55"
          squareSize={40}
          hoverFillColor="#004422"
        />
      </div>
      <CandlestickBackground />
    </div>
  );
};

export default ParallaxBackground;
