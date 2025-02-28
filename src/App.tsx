import { useState } from 'react';
import useAudio from './hooks/useAudio';
import { Bar, AreaClosed, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed, LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { GridRows, GridColumns } from '@visx/grid';
import { AxisLeft } from '@visx/axis';
import {
  ACCENT_COLOR,
  ACCENT_COLOR_DARK,
  BACKGROUND,
  BACKGROUND2,
  FFT_SIZE,
  HEIGHT,
  MARGIN,
  SMOOTHING_TIME_CONSTANT,
  WIDTH,
} from './config';
import Controls from './components/Controls';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { SeriesPoint } from '@visx/shape/lib/types';
import { localPoint } from '@visx/event';

type TooltipData = {
  // bar: SeriesPoint<number>;
  bar: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  key: number;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};

let tooltipTimeout: number;

function App() {
  const {
    startFrequencyData,
    stopFrequencyData,
    analyzer,
    frequencyData,
    isRunning,
  } = useAudio();

  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const [downsamplingRate, setDownsamplingRate] = useState(1);
  const [barPadding, setBarPadding] = useState(0.4);
  const [isBgTransparent, setIsBgTransparent] = useState(false);
  const [bgBorderRadius, setBgBorderRadius] = useState(20);

  const xScale = scaleBand({
    domain: [...Array(FFT_SIZE / 2 - 1)].map((_, index) => index) ?? [],
    range: [barPadding, WIDTH - barPadding],
    padding: barPadding,
  });

  const yScale = scaleLinear({
    domain: [0, 200],
    range: [HEIGHT - MARGIN.bottom, MARGIN.top],
  });

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  function setSmoothingTimeConstant(value: number) {
    if (analyzer) {
      analyzer.smoothingTimeConstant = value;
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          padding: '0 1rem',
          boxSizing: 'border-box',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,20,147,0.15) 30%, rgba(64,224,208,0.25) 60%, rgba(127,255,212,0.15) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <h1>VisX : Audio</h1>
        <p>{analyzer ? 'Connected' : 'Disconnected'}</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '100%',
          }}
        >
          <Controls
            isRunning={isRunning}
            downsamplingRate={downsamplingRate}
            setDownsamplingRate={setDownsamplingRate}
            barPadding={barPadding}
            setBarPadding={setBarPadding}
            bgBorderRadius={bgBorderRadius}
            setBgBorderRadius={setBgBorderRadius}
            startFrequencyData={startFrequencyData}
            stopFrequencyData={stopFrequencyData}
            setIsBgTransparent={setIsBgTransparent}
            isBgTransparent={isBgTransparent}
            smoothingTimeConstant={
              analyzer?.smoothingTimeConstant ?? SMOOTHING_TIME_CONSTANT
            }
            setSmoothingTimeConstant={setSmoothingTimeConstant}
          />

          <div
            style={{
              display: 'flex',
              width: WIDTH,
              maxWidth: '100%',
              flexDirection: 'row',
              gap: '0px',
              overflow: 'hidden',
              boxShadow: '-35px 35px 35px -35px rgba(0, 0, 0, 0.09)',
              borderRadius: `${bgBorderRadius}px`,
            }}
          >
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
              </defs>
            </svg>

            <svg
              width={'100%'}
              height={HEIGHT}
              style={{
                borderRadius: `${bgBorderRadius}px`,
              }}
              ref={containerRef}
            >
              <GradientPurpleRed id="teal" />
              {!isBgTransparent ? (
                <LinearGradient
                  id="background-gradient"
                  from={BACKGROUND}
                  to={BACKGROUND2}
                />
              ) : null}
              <LinearGradient
                id="area-gradient"
                from={ACCENT_COLOR_DARK}
                to={ACCENT_COLOR}
                toOpacity={0.6}
                fromOpacity={0.1}
              />
              <rect
                width={'100%'}
                height={HEIGHT}
                fill="url(#background-gradient)"
                opacity={1}
              />

              <Group top={0} left={0}>
                {/* <AxisLeft
                  scale={yScale}
                  stroke="#e0e0e03f"
                  tickStroke="#e0e0e03f"
                  strokeWidth={2}
                  label="Amplitude"
                  labelProps={{
                    fill: '#e0e0e03f',
                    fontSize: 12,
                    color: '#e0e0e03f',
                  }}
                  numTicks={5}
                  left={30}
                /> */}
                <GridRows
                  scale={yScale}
                  width={WIDTH}
                  height={HEIGHT}
                  stroke="#e0e0e03f"
                  strokeDasharray="2,2"
                  strokeOpacity={0.5}
                />
                <GridColumns
                  scale={xScale}
                  width={WIDTH}
                  height={HEIGHT}
                  stroke="#e0e0e03f"
                  strokeDasharray="2,2"
                  strokeOpacity={0.5}
                />
                {frequencyData &&
                  [...frequencyData].map((data, index) => {
                    const barWidth = xScale.bandwidth();
                    const barHeight = HEIGHT - yScale(data) - MARGIN.top;
                    const barX = xScale(index);
                    const barY = yScale(data) + MARGIN.top;

                    return index % downsamplingRate === 0 ? (
                      <Bar
                        x={barX}
                        y={barY}
                        height={barHeight}
                        width={barWidth}
                        fill="url(#area-gradient)"
                        key={index}
                        onMouseLeave={() => {
                          tooltipTimeout = window.setTimeout(() => {
                            hideTooltip();
                          }, 1000);
                        }}
                        onMouseMove={(event) => {
                          if (tooltipTimeout) clearTimeout(tooltipTimeout);
                          // TooltipInPortal expects coordinates to be relative to containerRef
                          // localPoint returns coordinates relative to the nearest SVG, which
                          // is what containerRef is set to in this example.
                          const eventSvgCoords = localPoint(event);
                          const left = barX! + barWidth / 2;
                          showTooltip({
                            tooltipData: {
                              x: barX,
                              y: barY,
                              height: barHeight,
                              width: barWidth,
                            } as any,
                            tooltipTop: eventSvgCoords?.y,
                            tooltipLeft: left,
                          });
                        }}
                      />
                    ) : null;
                  })}
              </Group>
            </svg>
          </div>
        </div>
        {tooltipOpen && tooltipData && (
          <TooltipInPortal
            top={tooltipTop}
            left={tooltipLeft}
            style={tooltipStyles}
          >
            <div style={{ color: 'red' }}>
              <strong>{tooltipData.key}</strong>
            </div>
            <div>Freq: {Math.round(tooltipData.x).toLocaleString()} Hz</div>
            <div>Amplitude: {tooltipData.y.toFixed(2)} dB</div>
          </TooltipInPortal>
        )}
      </div>
    </>
  );
}

export default App;

const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};
