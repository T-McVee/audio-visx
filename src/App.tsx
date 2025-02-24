import { useState } from 'react';
import useAudio from './hooks/useAudio';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed, LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { GridRows, GridColumns } from '@visx/grid';
import {
  ACCENT_COLOR,
  ACCENT_COLOR_DARK,
  BACKGROUND,
  BACKGROUND2,
  FREQUENCY_BANDS,
  HEIGHT,
  MARGIN,
  WIDTH,
} from './config';
import Controls from './components/Controls';

function App() {
  const { startFrequencyData, stopFrequencyData, analyzer, frequencyData } =
    useAudio();

  const [downsamplingRate, setDownsamplingRate] = useState(1);
  const [barPadding, setBarPadding] = useState(0.4);
  const [isBgTransparent, setIsBgTransparent] = useState(false);
  const [bgBorderRadius, setBgBorderRadius] = useState(20);

  const xScale = scaleBand({
    domain: [...Array(FREQUENCY_BANDS)].map((_, index) => index) ?? [],
    range: [barPadding, WIDTH - barPadding],
    padding: barPadding,
  });

  const yScale = scaleLinear({
    domain: [0, 200],
    range: [HEIGHT - MARGIN.bottom, MARGIN.top],
  });

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
              <Group top={0}>
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
                      />
                    ) : null;
                  })}
              </Group>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
