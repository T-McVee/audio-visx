import { useRef, useState } from 'react';
import { FREQUENCY_BANDS } from '../config';

export default function useAudio() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioAnalyzer, setAudioAnalyzer] = useState<AnalyserNode | null>(null);
  const [audioSource, setAudioSource] =
    useState<MediaStreamAudioSourceNode | null>(null);
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
      analyzerNode.fftSize = FREQUENCY_BANDS * 2;
      resolve(analyzerNode);
    });
    return analyzerNodePromise;
  }

  async function connectUsersMic(
    context: AudioContext,
    analyzer?: AnalyserNode
  ) {
    try {
      console.log('Checking microphone permissions...');
      // First check if we have permissions
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      console.log('Permission status:', permissionStatus.state);

      console.log('Connecting to microphone');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Stream details:', {
        active: stream.active,
        tracks: stream.getAudioTracks().map((track) => ({
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        })),
      });

      if (!stream.active || stream.getAudioTracks().length === 0) {
        throw new Error('Stream is not active or has no audio tracks');
      }
      const source = context.createMediaStreamSource(stream);
      if (analyzer) source.connect(analyzer);
      return source;
    } catch (err) {
      console.error('Error accessing microphone:', err);

      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            throw new Error(
              'Microphone access was denied. Please check your system settings:\n' +
                '- On macOS: System Preferences > Security & Privacy > Microphone\n' +
                '- On Windows: Settings > Privacy > Microphone\n' +
                '- On Linux: Check your system sound settings'
            );
          case 'NotFoundError':
            throw new Error(
              'No microphone was found. Please check if a microphone is connected.'
            );
          default:
            throw err;
        }
      }
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
    frequencyData,
  };
}
