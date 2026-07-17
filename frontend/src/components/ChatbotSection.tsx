import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, AlertCircle, Loader } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface ChatbotSectionProps {
  language: Language;
  authToken: string;
  analysisContext: string; // Summarized text context of the loan
  apiBaseUrl: string;
}

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({
  language,
  authToken,
  analysisContext,
  apiBaseUrl,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const text = UI_LOCALIZATION[language];

  // Auto-scroll to bottom of chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Insert initial greeting message when chat tab opens
  useEffect(() => {
    if (messages.length === 0) {
      let greeting = "Hello! I am your AI financial assistant. I have reviewed your loan document. You can ask me any questions about foreclosure fees, missed payment penalties, interest calculations, or ask me to explain specific clauses in simple words.";
      if (language === "hi") greeting = "नमस्ते! मैं आपका एआई वित्तीय सहायक हूँ। मैंने आपके लोन दस्तावेज़ की समीक्षा की है। आप मुझसे फोरक्लोज़र शुल्क, छूटे हुए भुगतान के जुर्माने, ब्याज की गणना के बारे में कोई भी प्रश्न पूछ सकते हैं, या मुझसे सरल शब्दों में विशिष्ट धाराओं को समझाने के लिए कह सकते हैं।";
      else if (language === "ta") greeting = "வணக்கம்! நான் உங்கள் AI நிதி உதவியாளர். உங்கள் கடன் ஆவணத்தை நான் ஆய்வு செய்துள்ளேன். முன்கூட்டியே மூடும் கட்டணங்கள், தவறிய கட்டண அபராதங்கள், வட்டி கணக்கீடுகள் அல்லது குறிப்பிட்ட சட்ட விதிகளின் எளிய விளக்கங்களை நீங்கள் என்னிடம் கேட்கலாம்.";
      else if (language === "te") greeting = "నమస్తే! నేను మీ AI ఆర్థిక సహాయకుడిని. నేను మీ రుణ పత్రాన్ని సమీక్షించాను. మీరు నన్ను ఫోర్‌క్లోజర్ ఛార్జీలు, తప్పిపోయిన ఈఎంఐ జరిమానాలు, వడ్డీ లెక్కల గురించి లేదా నిర్దిష్ట నిబంధనలను సులभమైన మాటల్లో వివరించమని అడగవచ్చు.";
      else if (language === "kn") greeting = "ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ AI ಹಣಕಾಸು ಸಹಾಯಕಿ. ನಾನು ನಿಮ್ಮ ಸಾಲದ ಒಪ್ಪಂದವನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ಮುಂಚಿತ ಪಾವತಿ ಶುಲ್ಕಗಳು, ತಪ್ಪಿದ ಕಂತುಗಳ ದಂಡಗಳು, ಬಡ್ಡಿ ಲೆಕ್ಕಾಚಾರಗಳು ಅಥವಾ ಕಾನೂನು ನಿಯಮಗಳ ಸರಳ ವಿವರಣೆಯ ಬಗ್ಗೆ ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು.";
      else if (language === "ml") greeting = "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ എഐ സാമ്പത്തിക സഹായിയാണ്. നിങ്ങളുടെ വായ്പ കരാർ ഞാൻ പരിശോധിച്ചിട്ടുണ്ട്. ഫോർക്ലോഷർ ചാർജുകൾ, തവണ വൈകിയാലുള്ള പിഴകൾ, പലിശ കണക്കുകൂട്ടലുകൾ എന്നിവയെക്കുറിച്ചുള്ള സംശയങ്ങൾ നിങ്ങൾക്ക് എന്നോട് ചോദിക്കാം.";

      setMessages([{ role: "model", text: greeting }]);
    }
  }, [language]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: messageText,
          history: messages,
          analysis_context: analysisContext
        })
      });

      if (!response.ok) {
        throw new Error("Chat failed to respond.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to get response. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="glass-panel animated-fade" style={{
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      height: "600px"
    }}>
      {/* Title Header */}
      <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px", marginBottom: "16px", flexShrink: 0 }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={20} color="var(--primary)" />
          {text.chatbotTitle}
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          {text.chatbotDesc}
        </p>
      </div>

      {/* Messages area */}
      <div style={{
        flexGrow: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        paddingRight: "6px",
        marginBottom: "16px"
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: "10px",
                alignItems: "flex-start"
              }}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
              )}

              {/* Message Bubble */}
              <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "var(--border-radius-md)",
                fontSize: "14px",
                lineHeight: "1.5",
                backgroundColor: isUser ? "var(--primary)" : "var(--bg-tertiary)",
                color: isUser ? "white" : "var(--text-primary)",
                border: isUser ? "none" : "1px solid var(--glass-border)",
                borderTopRightRadius: isUser ? "0" : "var(--border-radius-md)",
                borderTopLeftRadius: isUser ? "var(--border-radius-md)" : "0",
                boxShadow: isUser ? "0 4px 10px var(--primary-glow)" : "none",
                wordBreak: "break-word"
              }}>
                {msg.text}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                  border: "1px solid var(--glass-border)"
                }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: "10px", alignItems: "center" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)"
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              padding: "12px 16px",
              borderRadius: "var(--border-radius-md)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--glass-border)",
              borderTopLeftRadius: "0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-muted)",
              fontSize: "13px"
            }}>
              <Loader className="animate-spin" size={14} style={{ animation: "spin 1s linear infinite" }} />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Anchor for scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !loading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px", flexShrink: 0 }}>
          {text.quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.15)",
                color: "var(--primary)",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "var(--transition-smooth)"
              }}
              className="glass-panel-hover"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          padding: "8px 12px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--danger)",
          fontSize: "12px",
          marginBottom: "8px",
          flexShrink: 0
        }}>
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {/* Input box */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <input
          type="text"
          placeholder={text.chatPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          className="input-field"
          style={{ flexGrow: 1, marginBottom: 0 }}
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={loading || !inputValue.trim()}
          className="btn btn-primary"
          style={{ width: "48px", height: "48px", padding: 0, borderRadius: "var(--border-radius-md)" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
