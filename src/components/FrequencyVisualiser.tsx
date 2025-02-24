import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed, LinearGradient } from '@visx/gradient';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleBand, scaleLinear } from '@visx/scale';
import {
  ACCENT_COLOR,
  ACCENT_COLOR_DARK,
  BACKGROUND,
  BACKGROUND2,
  FREQUENCY_BANDS,
  HEIGHT,
  MARGIN,
  WIDTH,
} from '../config';

interface FrequencyVisualiserProps {
  width: number;
  height: number;
  frequencyData: Uint8Array | null;
  barPadding: number;
  frequencyBands: number;
  bgBorderRadius: number;
  isBgTransparent: boolean;
}

export function FrequencyVisualiser(props: FrequencyVisualiserProps) {
  const {
    frequencyData,
    barPadding,
    frequencyBands,
    bgBorderRadius,
    isBgTransparent,
  } = props;

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

              return index % frequencyBands === 0 ? (
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
  );
}
