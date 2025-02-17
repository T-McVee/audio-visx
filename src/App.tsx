import { useState } from "react"
import useAudio from "./hooks/useAudio";
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { GridRows, GridColumns } from '@visx/grid';

const margin = { top: 40, right: 40, bottom: 40, left: 40 };
const width = 1000;
const height = 600;

function App() {
  const { startFrequencyData, stopFrequencyData, analyzer, context, frequencyData } = useAudio(); 

  const [fidelity, setFidelity] = useState(1);

  const xScale = scaleBand({
    domain: [...Array(127)].map((_, index) => index) ?? [],
    range: [margin.left, width - margin.right],
    padding: 0.7,
  });

  const yScale = scaleLinear({
    domain: [0, 200],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
        <h1>Audio VisX</h1>
        <button onClick={() => context?.resume()}>Init Audio Context</button>
        <p>Analyzer: {analyzer ? 'Connected' : 'Disconnected'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <input type="number" value={fidelity} onChange={(e) => setFidelity(Number(e.target.value))} />
            <button onClick={startFrequencyData}>Start Frequency Data</button>
            <button onClick={stopFrequencyData}>Stop Frequency Data</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <svg width={0} height={0}>
               <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
              </defs>
            </svg>
            <svg width={width} height={height} rx={14}>
              <GradientPurpleRed id="teal" />
              <rect width={width} height={height} fill="url(#teal)" rx={14} />
              <Group top={0}>
                <GridRows scale={yScale} width={width} height={height} stroke="#e0e0e03f" />
                <GridColumns scale={xScale} width={width} height={height} stroke="#e0e0e03f" />
                {frequencyData && [...frequencyData].map((data, index) => {
                  const barWidth = xScale.bandwidth();
                  const barHeight = height - yScale(data) - margin.top;
                  const barX = xScale(index);
                  const barY = yScale(data) + margin.top;
                  
                  return (
                  index % fidelity === 0
                    ? <Bar
                        x={barX}
                        y={barY}
                        height={barHeight}
                        width={barWidth}
                        fill="url(#bar-gradient)"
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
