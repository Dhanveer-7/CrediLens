import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface VoicePlayerProps {
  language: Language;
  summaryText: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ language, summaryText }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const shouldAutoPlayRef = useRef(false);
  
  const text = UI_LOCALIZATION[language];

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      setSupported(true);
      
      // Trigger voice loading immediately
      window.speechSynthesis.getVoices();
      
      // Listens for asynchronously loaded voices (common in Chrome/Edge)
      const handleVoicesChanged = () => {
        if (synthRef.current) {
          synthRef.current.getVoices();
        }
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      
      return () => {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  useEffect(() => {
    // Cancel current speech on language change, and mark for auto-play if we were currently playing or paused
    if (synthRef.current) {
      if (isPlaying || isPaused) {
        shouldAutoPlayRef.current = true;
      }
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [language]);

  // If auto-play is flagged and the new translated summary arrives, start speaking automatically
  useEffect(() => {
    if (shouldAutoPlayRef.current && summaryText && supported) {
      shouldAutoPlayRef.current = false;
      const timer = setTimeout(() => {
        handlePlay();
      }, 200); // 200ms buffer to let browser voice caches reload
      return () => clearTimeout(timer);
    }
  }, [summaryText]);

  const getLanguageCode = (lang: Language): string => {
    switch (lang) {
      case "hi": return "hi-IN";
      case "ta": return "ta-IN";
      case "te": return "te-IN";
      case "kn": return "kn-IN";
      case "ml": return "ml-IN";
      default: return "en-IN"; // English (India) as default fallback
    }
  };

  const handlePlay = () => {
    if (!supported || !synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Cancel any current speaking
    synthRef.current.cancel();

    const langCode = getLanguageCode(language);
    console.log(`[VoicePlayer] Initiating play. Target Language: ${language}, LangCode: ${langCode}`);
    console.log(`[VoicePlayer] Summary text to speak (length: ${summaryText?.length}): "${summaryText?.substring(0, 60)}..."`);

    const utterance = new SpeechSynthesisUtterance(summaryText);
    utteranceRef.current = utterance;
    utterance.lang = langCode;

    // Find a voice matching the language code
    const voices = synthRef.current.getVoices();
    console.log(`[VoicePlayer] Total voices retrieved from browser: ${voices.length}`);
    
    const cleanLangCode = langCode.toLowerCase().replace("_", "-");
    const langPrefix = language.toLowerCase();

    let matchingVoice = voices.find(v => {
      const cleanVal = v.lang.toLowerCase().replace("_", "-");
      return cleanVal === cleanLangCode || cleanVal.startsWith(cleanLangCode);
    });

    if (!matchingVoice) {
      matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (matchingVoice) {
      console.log(`[VoicePlayer] Matching voice found: "${matchingVoice.name}" (${matchingVoice.lang}) [local: ${matchingVoice.localService}]`);
      utterance.voice = matchingVoice;
    } else {
      console.warn(`[VoicePlayer] No matching voice found for "${langCode}" or "${langPrefix}" in the browser list. Defaulting to system voice.`);
      // Print available languages on this device to console
      console.log("[VoicePlayer] Available voice languages on this device:", Array.from(new Set(voices.map(v => v.lang))));
    }
    
    utterance.rate = 0.95;

    utterance.onend = () => {
      console.log("[VoicePlayer] Speech finished playing.");
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("[VoicePlayer] Speech synthesis error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    synthRef.current.speak(utterance);
  };

  const handlePause = () => {
    if (!supported || !synthRef.current) return;
    synthRef.current.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!supported || !synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!supported) return null;

  return (
    <div className="glass-panel animated-fade" style={{ padding: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)"
          }}>
            <Volume2 size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>{text.voiceTitle}</h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{text.voiceDesc}</p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Waveform visualizer */}
          <div className={`audio-visualizer ${isPlaying ? "playing" : ""}`}>
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {isPlaying ? (
              <button onClick={handlePause} className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                <Pause size={16} />
                <span>{text.pause}</span>
              </button>
            ) : (
              <button onClick={handlePlay} className="btn btn-primary" style={{ padding: "8px 12px" }}>
                <Play size={16} fill="white" />
                <span>{text.play}</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button onClick={handleStop} className="btn btn-secondary" style={{ padding: "8px 12px", color: "var(--danger)" }}>
                <Square size={16} fill="var(--danger)" />
                <span>{text.stop}</span>
              </button>
            )}
          </div>
        </div>

      </div>
      
      {isPlaying && (
        <p style={{ fontSize: "12px", color: "var(--primary)", marginTop: "12px", fontWeight: "600", fontStyle: "italic", textAlign: "right" }}>
          {text.readingStatus}
        </p>
      )}
    </div>
  );
};
