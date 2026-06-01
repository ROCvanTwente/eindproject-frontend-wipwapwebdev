import { useEffect, useRef, useState } from 'react';

interface UseSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const {
    language = 'nl-NL',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechError, setSpeechError] = useState('');
  const [isSpeechSupported] = useState(() => {
    return 'speechSynthesis' in window;
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      return;
    }

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getPreferredVoice = () => {
    const normalizedLanguage = language.toLowerCase();

    return (
      voices.find((voice) => voice.lang.toLowerCase() === normalizedLanguage) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith(normalizedLanguage.split('-')[0])) ||
      voices.find((voice) => voice.default) ||
      voices[0] ||
      null
    );
  };

  const speak = (text: string) => {
    if (!isSpeechSupported) {
      console.warn('Speech Synthesis API not supported');
      setSpeechError('Tekst-naar-spraak wordt niet ondersteund in deze browser.');
      return;
    }

    if (!text.trim()) {
      setSpeechError('Geen tekst om voor te lezen.');
      return;
    }

    setSpeechError('');

    const selectedVoice = getPreferredVoice();
    if (!selectedVoice) {
      setSpeechError('Geen bruikbare spraakstem gevonden in deze browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error, (error as SpeechSynthesisErrorEvent).error);
      setIsPlaying(false);
      setIsPaused(false);
      const speechErrorCode = (error as SpeechSynthesisErrorEvent).error;

      if (speechErrorCode === 'interrupted') {
        setSpeechError('De spraak is onderbroken door de browser. Probeer nogmaals of een andere browser.');
        return;
      }

      if (speechErrorCode === 'canceled') {
        setSpeechError('De spraak is geannuleerd.');
        return;
      }

      setSpeechError(`De browser kon de spraak niet starten (${speechErrorCode || 'unknown'}).`);
    };

    utteranceRef.current = utterance;
    window.requestAnimationFrame(() => {
      window.speechSynthesis.speak(utterance);
    });
  };

  const pause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSpeechSupported,
    hasVoices: voices.length > 0,
    speechError,
  };
}
