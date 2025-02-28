import React from 'react';
import { FFT_SIZE } from '../config';

interface ControlsProps {
  isRunning: boolean;
  downsamplingRate: number;
  setDownsamplingRate: (value: number) => void;
  barPadding: number;
  setBarPadding: (value: number) => void;
  bgBorderRadius: number;
  setBgBorderRadius: (value: number) => void;
  startFrequencyData: () => void;
  stopFrequencyData: () => void;
  setIsBgTransparent: (value: boolean) => void;
  isBgTransparent: boolean;
  setSmoothingTimeConstant: (value: number) => void;
  smoothingTimeConstant: number;
}

export default function Controls(props: ControlsProps) {
  const {
    isRunning,
    downsamplingRate,
    setDownsamplingRate,
    barPadding,
    setBarPadding,
    bgBorderRadius,
    setBgBorderRadius,
    startFrequencyData,
    stopFrequencyData,
    setIsBgTransparent,
    isBgTransparent,
    setSmoothingTimeConstant,
    smoothingTimeConstant,
  } = props;

  return (
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <button onClick={startFrequencyData} disabled={isRunning}>
          Start Frequency Data
        </button>
        <button onClick={stopFrequencyData} disabled={!isRunning}>
          Stop Frequency Data
        </button>
        <button onClick={() => setIsBgTransparent(!isBgTransparent)}>
          Toggle Background
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <label htmlFor="frequencyBands">Downsampling rate (resoltuion)</label>
          <input
            type="number"
            id="downsamplingRate"
            value={downsamplingRate}
            onChange={(e) => setDownsamplingRate(Number(e.target.value))}
            min={1}
            max={FFT_SIZE}
          />
        </div>
        <div>
          <label htmlFor="barPadding">Bar Padding</label>
          <input
            type="range"
            id="barPadding"
            value={barPadding}
            onChange={(e) => setBarPadding(Number(e.target.value))}
            step={0.01}
            min={-4}
            max={1}
          />
        </div>
        <div>
          <label htmlFor="bgBorderRadius">Background Border Radius</label>
          <input
            type="range"
            id="bgBorderRadius"
            value={bgBorderRadius}
            onChange={(e) => setBgBorderRadius(Number(e.target.value))}
            step={1}
            min={0}
            max={300}
          />
        </div>
        <div>
          <label htmlFor="smoothingTimeConstant">Time smoothing</label>
          <input
            type="range"
            id="smoothingTimeConstant"
            value={smoothingTimeConstant}
            onChange={(e) => setSmoothingTimeConstant(Number(e.target.value))}
            step={0.001}
            min={0.2}
            max={1}
          />
        </div>
      </div>
    </div>
  );
}
