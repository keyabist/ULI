import React, { useEffect, useMemo, useRef } from 'react';
import '../styles/Candlestick.css';

const NUM_CANDLES = 60;
const CHART_WIDTH = window.innerWidth;
const CHART_HEIGHT = window.innerHeight;

// Generate a random integer in [min, max]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateCandles = () => {
  const data = [];
  const spacing = CHART_WIDTH / NUM_CANDLES;
  
  // Start near the vertical middle
  let lastClose = Math.floor(CHART_HEIGHT / 2);

  for (let i = 0; i < NUM_CANDLES; i++) {
    const open = lastClose;
    // random delta, can be negative or positive
    const delta = randInt(-40, 40);
    const close = open + delta;
    const candleHigh = Math.max(open, close) + randInt(5, 20);
    const candleLow = Math.min(open, close) - randInt(5, 20);

    const x = i * spacing + spacing / 2; // center each candle in its slot
    const bodyWidth = 12; // Increased candle body thickness

    data.push({
      open,
      close,
      high: candleHigh,
      low: candleLow,
      x,
      width: bodyWidth,
    });

    lastClose = close; // next candle's open starts here
  }

  return data;
};

const RealisticCandlestickBackground = () => {
  // Memoize the generated candles so it only runs once.
  const candles = useMemo(() => generateCandles(), []);
  
  // Compute midpoints of each candle
  const midpoints = candles.map(c => ({
    x: c.x,
    y: (c.open + c.close) / 2,
  }));

  // Build a path string connecting the midpoints
  const linePath = midpoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const pathRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const pathEl = pathRef.current;
    const circleEl = circleRef.current;
    if (!pathEl || !circleEl) return;

    const totalLength = pathEl.getTotalLength();
    let startTime = null;
    const duration = 5000; // 5-second loop

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;
      const point = pathEl.getPointAtLength(totalLength * progress);
      circleEl.setAttribute('cx', point.x);
      circleEl.setAttribute('cy', point.y);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="realistic-candlestick-bg">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
      >
        {/* Render Candlesticks */}
        {candles.map((candle, idx) => {
          // Change to red for all candles (for a unified red theme)
          const color = '#ff0000';
          const bodyY = Math.min(candle.open, candle.close);
          const bodyHeight = Math.abs(candle.close - candle.open);
          return (
            <g key={idx}>
              {/* Wick */}
              <line
                x1={candle.x}
                y1={candle.high}
                x2={candle.x}
                y2={candle.low}
                stroke={color}
                strokeWidth="2"
                className="candle-wick"
              />

              {/* Body */}
              <rect
                x={candle.x - candle.width / 2}
                y={bodyY}
                width={candle.width}
                height={bodyHeight}
                fill={color}
                className="candle-body"
              />
            </g>
          );
        })}

        {/* Midpoint Line */}
        <path
          d={linePath}
          ref={pathRef}
          fill="none"
          stroke="#ff0000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Animated Pulse (smaller pulse) */}
        <circle
          ref={circleRef}
          r="6"  // smaller radius
          fill="#ff0000"
          className="pulse"
        />
      </svg>
    </div>
  );
};

export default RealisticCandlestickBackground;
