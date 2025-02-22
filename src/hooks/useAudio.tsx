import { useRef, useState } from "react";
import { FrequencyBands } from "../App";



export default function useAudio() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioAnalyzer, setAudioAnalyzer] = useState<AnalyserNode | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);

  async function createNewAudioContext() {
    const contextPromise = new Promise<AudioContext>((resolve) => {
      const context = new AudioContext();
      context.onstatechange = () => {
        if (context.state === 'running') resolve(context);
      };
    });
    return contextPromise;
  }

  async function createAnalyzer(context: AudioContext) {
    console.log('Creating analyzer');
    const analyzerNodePromise = new Promise<AnalyserNode>((resolve) => {
      const analyzerNode = context.createAnalyser();
      analyzerNode.fftSize = FrequencyBands * 2;
      resolve(analyzerNode);
    });
    return analyzerNodePromise;
  }

  async function connectUsersMic(context: AudioContext, analyzer?: AnalyserNode) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);
      if (analyzer) source.connect(analyzer);
      return source;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }

  async function audioContextSetup() { 
    if (audioContext && audioAnalyzer && audioSource) return;

    try {
      
        const context = await createNewAudioContext();
        setAudioContext(context);
      
        const analyzer = await createAnalyzer(context);
        setAudioAnalyzer(analyzer);
      
        const source = await connectUsersMic(context, analyzer);
      setAudioSource(source);
      
      return { context, analyzer, source };
      } catch (err) {
        console.error('Error setting up audio context:', err);
        throw err;
      }
  }

  function getFrequencyData(analyzer: AnalyserNode) {
    const frequencyData = new Uint8Array(analyzer!.frequencyBinCount);
    analyzer!.getByteFrequencyData(frequencyData);

    return frequencyData;
  }

  async function startFrequencyData() {  
    if (isRunning) return;
    
    const audioContext = await audioContextSetup();
    const analyzer = audioContext?.analyzer ?? audioAnalyzer;

    if (!analyzer) return;
    
    const updateData = () => {
      const data = getFrequencyData(analyzer!);
      setFrequencyData(data);
      // console.log('DATA:', data);

      animationFrameRef.current = requestAnimationFrame(updateData);
    };

    // Start the animation frame
    animationFrameRef.current = requestAnimationFrame(updateData);

    setIsRunning(true);
  }


  function stopFrequencyData() {
    if (!isRunning) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setFrequencyData(null);
    }

    setIsRunning(false);
  }

  return {
    audioContextSetup,
    startFrequencyData,
    stopFrequencyData,
    
    analyzer: audioAnalyzer,
    source: audioSource,
    context: audioContext,
    frequencyData
  }
}
