import { useState } from "react"
import useAudio from "./hooks/useAudio";
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed, LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { GridRows, GridColumns } from '@visx/grid';


const margin = { top: 40, right: 10, bottom: 40, left: 10 };
const width = typeof window !== 'undefined' ? window.innerWidth : 1600;
const height = 600;
export const FrequencyBands = 256;
export const background = '#3b6978';
export const background2 = '#204051';
export const accentColor = '#edffea';
export const accentColorDark = '#75daad';

function App() {
  const { startFrequencyData, stopFrequencyData, analyzer, frequencyData } = useAudio(); 

  const [frequencyBands, setFrequencyBands] = useState(1);
  const [barPadding, setBarPadding] = useState(0.4);

  const xScale = scaleBand({
    domain: [...Array(FrequencyBands)].map((_, index) => index) ?? [],
    // range: [margin.left, width - margin.right],
    range: [barPadding, width - barPadding],
    padding: barPadding,
  });

  const yScale = scaleLinear({
    domain: [0, 200],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '0 1rem', boxSizing: 'border-box' }}>
        <h1>VisX Audio</h1>
        
        <p>{analyzer ? 'Connected' : 'Disconnected'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', maxWidth: '100%',  }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <label htmlFor="frequencyBands">Frequency Bands</label>
          <input type="number" id="frequencyBands" value={frequencyBands} onChange={(e) => setFrequencyBands(Number(e.target.value))} min={1} max={127} />
          <label htmlFor="barPadding">Bar Padding</label>
            <input type="range" id="barPadding" value={barPadding} onChange={(e) => setBarPadding(Number(e.target.value))} step={0.01} min={-4} max={1} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            
            <button onClick={startFrequencyData}>Start Frequency Data</button>
            <button onClick={stopFrequencyData}>Stop Frequency Data</button>
          </div>
          <div style={{ display: 'flex', width: width, maxWidth: '100%', flexDirection: 'row', gap: '0px', overflow: 'hidden'}}>
            <svg width={0} height={0}>
               <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
              </defs>
            </svg>
            <svg width={'100%'} height={height} style={{ borderRadius: '2rem' }}>
              <GradientPurpleRed id="teal" />
              <LinearGradient id="background-gradient" from={background} to={background2} />
              <LinearGradient id="area-gradient" from={accentColorDark} to={accentColor} toOpacity={0.6} fromOpacity={0.1} />
              <rect width={'100%'} height={height} fill="url(#background-gradient)"  opacity={1} />
              <Group top={0}>
                <GridRows
                  scale={yScale}
                  width={width}
                  height={height}
                  stroke="#e0e0e03f"
                  strokeDasharray="2,2"
                  strokeOpacity={0.5}
                />
                <GridColumns
                  scale={xScale}
                  width={width}
                  height={height}
                  stroke="#e0e0e03f"
                  strokeDasharray="2,2"
                  strokeOpacity={0.5}
                />
                {frequencyData && [...frequencyData].map((data, index) => {
                  const barWidth = xScale.bandwidth();
                  const barHeight = height - yScale(data) - margin.top;
                  const barX = xScale(index);
                  const barY = yScale(data) + margin.top;
                  
                  return (
                  index % frequencyBands === 0
                    ? <Bar
                        x={barX}
                        y={barY}
                        height={barHeight}
                        width={barWidth}
                        fill="url(#area-gradient)"
                        key={index}
                      />
                    : null
                  )})}
              </Group>
            </svg>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
