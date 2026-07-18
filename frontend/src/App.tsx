import React, { useState, useEffect } from "react";
import {
  FileText,
  Scale,
  BookOpen,
  MessageSquare,
  History,
  Languages,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Type,
  Briefcase,
  AlertCircle,
  Activity
} from "lucide-react";

import { UI_LOCALIZATION, type Language } from "./locale";
import { UploadSection } from "./components/UploadSection";
import { RiskMeter } from "./components/RiskMeter";
import { LoanSummaryCards } from "./components/LoanSummaryCards";
import { ChargesDetector } from "./components/ChargesDetector";
import { ClauseExplainer } from "./components/ClauseExplainer";
import { VoicePlayer } from "./components/VoicePlayer";
import { CompareSection } from "./components/CompareSection";
import { DictionarySection } from "./components/DictionarySection";
import { ChatbotSection } from "./components/ChatbotSection";
import { ThreeCoin } from "./components/ThreeCoin";
import { PredictorSection } from "./components/PredictorSection";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"upload" | "dashboard" | "compare" | "dictionary" | "chatbot" | "history" | "predictor">("upload");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [textScale, setTextScale] = useState<"normal" | "large" | "xl">("normal");
  
  // Auth States
  const [token, setToken] = useState<string | null>(localStorage.getItem("credilens_token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("credilens_email"));
  const [userFullname, setUserFullname] = useState<string | null>(localStorage.getItem("credilens_fullname"));
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Analysis Report States
  const [englishAnalysis, setEnglishAnalysis] = useState<any | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [translating, setTranslating] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const text = UI_LOCALIZATION[language];

  // Sync Theme on load
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  }, [theme]);

  // Sync font size scaling
  useEffect(() => {
    const root = document.documentElement;
    if (textScale === "large") {
      root.style.setProperty("--font-multiplier", "1.2");
    } else if (textScale === "xl") {
      root.style.setProperty("--font-multiplier", "1.35");
    } else {
      root.style.setProperty("--font-multiplier", "1.0");
    }
  }, [textScale]);

  // Handle active analysis translation when language changes
  useEffect(() => {
    const translateActiveReport = async () => {
      if (!englishAnalysis) return;
      
      // If switched back to English, simply load the base analysis
      if (language === "en") {
        setActiveAnalysis(englishAnalysis);
        return;
      }

      setTranslating(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/translate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            analysis_data: englishAnalysis,
            target_language: getLanguageName(language),
          }),
        });

        if (!response.ok) throw new Error("Translation failed");

        const translatedData = await response.json();
        // Preserving metadata IDs
        translatedData._id = englishAnalysis._id;
        setActiveAnalysis(translatedData);
      } catch (err) {
        console.error("Failed translation:", err);
      } finally {
        setTranslating(false);
      }
    };

    translateActiveReport();
  }, [language, englishAnalysis]);

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case "hi": return "Hindi";
      case "ta": return "Tamil";
      case "te": return "Telugu";
      case "kn": return "Kannada";
      case "ml": return "Malayalam";
      default: return "English";
    }
  };

  // Load user report history
  const loadHistory = async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token, englishAnalysis]);

  // Auth Functions
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const url = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering 
      ? { email: authEmail, password: authPassword, fullname: authName }
      : { email: authEmail, password: authPassword };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("credilens_token", data.token);
      localStorage.setItem("credilens_email", data.email);
      localStorage.setItem("credilens_fullname", data.fullname);
      
      setToken(data.token);
      setUserEmail(data.email);
      setUserFullname(data.fullname);
      setAuthPassword("");
      setAuthEmail("");
      setAuthName("");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

  const sendGoogleToken = async (credential: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Google Login failed");
      }

      const data = await response.json();
      localStorage.setItem("credilens_token", data.token);
      localStorage.setItem("credilens_email", data.email);
      localStorage.setItem("credilens_fullname", data.fullname);
      
      setToken(data.token);
      setUserEmail(data.email);
      setUserFullname(data.fullname);
    } catch (err: any) {
      setAuthError(err.message || "Google Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const GOOGLE_CLIENT_ID = ""; // Insert your Google Client ID here to enable real Google Login
    if (GOOGLE_CLIENT_ID && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: any) => {
          sendGoogleToken(res.credential);
        }
      });
      (window as any).google.accounts.id.prompt();
    } else {
      console.warn("No Google Client ID configured in App.tsx. Simulating Google Login via a mock OAuth profile...");
      sendGoogleToken("mock_google_credential");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("credilens_token");
    localStorage.removeItem("credilens_email");
    localStorage.removeItem("credilens_fullname");
    setToken(null);
    setUserEmail(null);
    setUserFullname(null);
    setEnglishAnalysis(null);
    setActiveAnalysis(null);
    setActiveTab("upload");
  };

  const handleAnalysisComplete = (data: any) => {
    // Store original English analysis for translation triggers
    setEnglishAnalysis(data);
    setActiveAnalysis(data);
    setActiveTab("dashboard");
  };

  const loadHistoricalAnalysis = (historyRecord: any) => {
    const rawAnalysis = historyRecord.analysis;
    rawAnalysis._id = historyRecord._id;
    setEnglishAnalysis(rawAnalysis);
    setActiveAnalysis(rawAnalysis);
    setActiveTab("dashboard");
  };

  // Context builder for chatbot
  const getChatContextString = (): string => {
    if (!englishAnalysis) return "";
    const sum = englishAnalysis.summary;
    const risks = englishAnalysis.risk_assessment;
    const charges = englishAnalysis.hidden_charges || [];
    
    return `
      Loan Amount: ${sum.loan_amount}
      Interest Rate: ${sum.interest_rate}
      Processing Fee: ${sum.processing_fee}
      Duration: ${sum.loan_duration}
      EMI: ${sum.estimated_emi}
      Risk Score: ${risks.risk_score} (${risks.risk_level})
      Risk Factors: ${risks.key_risks?.join(", ")}
      Detected Charges: ${charges.map((c: any) => `${c.charge_name} (${c.amount_or_rate}): ${c.description}`).join("; ")}
    `;
  };

  // Text string for Speech synthesis summary
  const getAudioSummaryText = (): string => {
    if (!activeAnalysis) return "";
    const sum = activeAnalysis.summary;
    const risks = activeAnalysis.risk_assessment;
    
    if (language === "hi") {
      return `यह लोन राशि ${sum.loan_amount} है जिसकी वार्षिक ब्याज दर ${sum.interest_rate} है। आपकी अनुमानित मासिक किस्त यानी ईएमआई ${sum.estimated_emi} होगी। जोखिम का स्कोर सौ में से ${risks.risk_score} है, जो इसे ${risks.risk_level} श्रेणी में डालता है।`;
    }
    if (language === "ta") {
      return `இந்த கடன் தொகை ${sum.loan_amount} ஆகும். இதன் வட்டி விகிதம் வருடத்திற்கு ${sum.interest_rate} ஆகும். உங்கள் மதிப்பிடப்பட்ட மாதாந்திர தவணைத் தொகை ${sum.estimated_emi} ஆகும். அபாய மதிப்பெண் 100க்கு ${risks.risk_score} ஆகும், இது இந்த கடனை ${risks.risk_level} அளவாக காட்டுகிறது.`;
    }
    if (language === "te") {
      return `ఈ రుణ మొత్తం ${sum.loan_amount}. దీని వడ్డీ రేటు సంవత్సరానికి ${sum.interest_rate}. మీ అంచనా వేసిన నెలవారీ వాయిదా ${sum.estimated_emi}. నష్టభయం స్కోరు 100 కి ${risks.risk_score}, ఇది ఈ రుణాన్ని ${risks.risk_level} శ్రేణిగా చూపుతుంది.`;
    }
    if (language === "kn") {
      return `ಈ ಸಾಲದ ಮೊತ್ತ ${sum.loan_amount}. ಇದರ ಬಡ್ಡಿ ದರ ವರ್ಷಕ್ಕೆ ${sum.interest_rate}. ನಿಮ್ಮ ಅಂದಾಜು ಮಾಸಿಕ ಕಂತು ${sum.estimated_emi} ಆಗಿದೆ. ಅಪಾಯದ ಅಂಕ 100 ಕ್ಕೆ ${risks.risk_score} ಆಗಿದೆ, ಇದು ಈ ಸಾಲವನ್ನು ${risks.risk_level} ಮಟ್ಟದಲ್ಲಿದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.`;
    }
    if (language === "ml") {
      return `ഈ ലോൺ തുക ${sum.loan_amount} ആണ്. ഇതിന്റെ പലിശ നിരക്ക് വർഷത്തിൽ ${sum.interest_rate} ആണ്. നിങ്ങളുടെ പ്രതിമാസ ഗഡു ${sum.estimated_emi} ആണ്. റിസ്ക് സ്കോർ 100-ൽ ${risks.risk_score} ആണ്, ഇത് ഈ ലോണിനെ ${risks.risk_level} വിഭാഗത്തിലാക്കുന്നു.`;
    }
    
    return `This loan is for ${sum.loan_amount} with an interest rate of ${sum.interest_rate} per year. Your estimated monthly EMI is ${sum.estimated_emi} for a duration of ${sum.loan_duration}. The risk score evaluated is ${risks.risk_score} out of 100, which classifies this loan as ${risks.risk_level}.`;
  };

  const getPredictorLabel = (lang: Language): string => {
    switch (lang) {
      case "hi": return "स्वीकृति गणना";
      case "ta": return "ஒப்புதல் கணிப்பான்";
      case "te": return "ఆమోదం క్యాలిక్యులేటర్";
      case "kn": return "ಅನುಮೋದನೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್";
      case "ml": return "അനുമതി കാൽക്കുലേറ്റർ";
      default: return "Approval Calculator";
    }
  };

  // Auth Screen Render
  if (!token) {
    return (
      <div 
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "radial-gradient(circle at top, var(--bg-tertiary) 0%, var(--bg-primary) 100%)",
          position: "relative",
          overflow: "hidden"
        }} 
        className="auth-layout-container"
      >
        {/* Floating background decorative elements */}
        <div className="floating-circle-1"></div>
        <div className="floating-circle-2"></div>

        {/* Left Column: 3D Royal Gold Coin Showcase */}
        <div 
          className="auth-3d-showcase" 
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
            height: "480px"
          }}
        >
          <div style={{ width: "360px", height: "360px" }}>
            <ThreeCoin size={1.1} />
          </div>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
              Smart 3D Loan Analysis
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", maxWidth: "340px", margin: "0 auto", lineHeight: "1.5" }}>
              Explore loan interest rates, detect hidden charges, and simplify complex fine-prints interactively.
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div style={{ display: "flex", justifyContent: "center", zIndex: 3 }} className="auth-card-container">
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "40px 32px" }}>
          
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary), var(--accent-teal))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px var(--primary-glow)"
            }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.03em" }}>CrediLens</h1>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.1em" }}>
                Loan Fine-Print Explainer
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
            {isRegistering ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "24px" }}>
            Simplify and translate your legal loan paperwork in seconds.
          </p>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isRegistering && (
              <div className="input-group">
                <label className="input-label">{text.fullname}</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">{text.email}</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">{text.password}</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="input-field"
              />
            </div>

            {authError && (
              <p style={{ color: "var(--danger)", fontSize: "13px", fontWeight: "500", marginTop: "4px" }}>
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px", marginTop: "8px" }}
            >
              {authLoading ? (
                <span>{isRegistering ? text.signingUp : text.signingIn}</span>
              ) : (
                <span>{isRegistering ? text.register : text.login}</span>
              )}
            </button>
          </form>

          {/* Google Login Divider and Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <span style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(0,0,0,0.06)" }}></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>OR</span>
            <span style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(0,0,0,0.06)" }}></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-secondary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: "4px" }}>
              <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1-.8 1.9-1.6 2.5v2.1h2.6c1.5-1.4 2.4-3.4 2.4-6.2z"/>
              <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.6-2.1c-.7.5-1.7.8-3.4.8-2.6 0-4.8-1.8-5.6-4.2H.7v2.2C2.2 15.3 5.4 18 9 18z"/>
              <path fill="#FBBC05" d="M3.4 10.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V4.5H.7C.2 5.4 0 6.6 0 7.8s.2 2.4.7 3.3l2.7-2.1z"/>
              <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.2 2.7.7 5.6l2.7 2.1c.8-2.4 3-4.1 5.6-4.1z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {isRegistering ? text.haveAccount : text.noAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="app-container" style={{ position: "relative" }}>
      <div className="floating-circle-1" />
      <div className="floating-circle-2" />
      {/* Top Navbar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="brand-logo">CrediLens</h1>
            <p style={{ fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
              {text.tagline}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="header-controls">
          {/* Text scale accessibility */}
          <div style={{ display: "flex", gap: "2px", background: "var(--bg-secondary)", padding: "4px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
            <button
              onClick={() => setTextScale("normal")}
              style={{
                background: textScale === "normal" ? "var(--bg-tertiary)" : "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                color: textScale === "normal" ? "var(--primary)" : "var(--text-secondary)"
              }}
              title="Normal text size"
            >
              <Type size={14} />
            </button>
            <button
              onClick={() => setTextScale("large")}
              style={{
                background: textScale === "large" ? "var(--bg-tertiary)" : "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                color: textScale === "large" ? "var(--primary)" : "var(--text-secondary)"
              }}
              title="Large text size"
            >
              <Type size={18} />
            </button>
            <button
              onClick={() => setTextScale("xl")}
              style={{
                background: textScale === "xl" ? "var(--bg-tertiary)" : "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                color: textScale === "xl" ? "var(--primary)" : "var(--text-secondary)"
              }}
              title="Extra large text size"
            >
              <Type size={22} />
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn btn-secondary"
            style={{ width: "36px", height: "36px", padding: 0 }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Languages size={16} color="var(--text-secondary)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="lang-select"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          {/* User profile & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderLeft: "1px solid var(--glass-border)", paddingLeft: "16px" }}>
            <div style={{ display: "none" }} className="profile-display">
              <style>{`
                @media (min-width: 640px) {
                  .profile-display { display: flex !important; flex-direction: column; text-align: right; }
                }
              `}</style>
              <span style={{ fontSize: "13px", fontWeight: "700" }}>{userFullname}</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: "36px", height: "36px", padding: 0, color: "var(--danger)" }}
              title={text.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        
        {/* Navigation Tabs */}
        <nav className="nav-tabs" style={{ alignSelf: "flex-start", width: "100%", overflowX: "auto", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
          <button
            onClick={() => setActiveTab("upload")}
            className={`nav-tab ${activeTab === "upload" ? "active" : ""}`}
          >
            <FileText size={16} />
            <span>{text.uploadTitle}</span>
          </button>

          {activeAnalysis && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <Sparkles size={16} />
              <span>{text.dashboard}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("compare")}
            className={`nav-tab ${activeTab === "compare" ? "active" : ""}`}
          >
            <Scale size={16} />
            <span>{text.compareLoans}</span>
          </button>

          <button
            onClick={() => setActiveTab("dictionary")}
            className={`nav-tab ${activeTab === "dictionary" ? "active" : ""}`}
          >
            <BookOpen size={16} />
            <span>{text.dictionary}</span>
          </button>

          {activeAnalysis && (
            <button
              onClick={() => setActiveTab("chatbot")}
              className={`nav-tab ${activeTab === "chatbot" ? "active" : ""}`}
            >
              <MessageSquare size={16} />
              <span>{text.chatbot}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("history")}
            className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
          >
            <History size={16} />
            <span>{text.history}</span>
          </button>

          <button
            onClick={() => setActiveTab("predictor")}
            className={`nav-tab ${activeTab === "predictor" ? "active" : ""}`}
          >
            <Activity size={16} />
            <span>{getPredictorLabel(language)}</span>
          </button>
        </nav>

        {/* Dynamic Panels */}
        <div style={{ flexGrow: 1 }}>
          
          {/* UPLOAD PANEL */}
          {activeTab === "upload" && (
            <UploadSection
              language={language}
              authToken={token}
              apiBaseUrl={API_BASE_URL}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {/* DASHBOARD PANEL */}
          {activeTab === "dashboard" && activeAnalysis && (
            !activeAnalysis.is_valid_loan_document ? (
              <div className="glass-panel animated-fade" style={{
                padding: "40px",
                maxWidth: "600px",
                margin: "40px auto",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                border: "1px solid rgba(225, 29, 72, 0.2)",
                backgroundColor: "rgba(225, 29, 72, 0.02)"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(225, 29, 72, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--danger)",
                  boxShadow: "0 0 20px var(--danger-glow)"
                }}>
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--danger)" }}>
                  {text.error}
                </h3>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {activeAnalysis.invalid_reason || "The uploaded document is not a valid loan agreement or offer letter."}
                </p>
                <button
                  onClick={() => {
                    setEnglishAnalysis(null);
                    setActiveAnalysis(null);
                    setActiveTab("upload");
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: "12px" }}
                >
                  {text.goBack}
                </button>
              </div>
            ) : (
              <div className="dashboard-grid">
                {/* Left Column: Risk details & TTS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Voice Explainer widget */}
                <VoicePlayer
                  language={language}
                  summaryText={getAudioSummaryText()}
                />

                {/* Risk Gauge */}
                <RiskMeter
                  language={language}
                  riskScore={activeAnalysis.risk_assessment.risk_score}
                  keyRisks={activeAnalysis.risk_assessment.key_risks}
                  recommendations={activeAnalysis.risk_assessment.recommendations}
                />
              </div>

              {/* Right Column: Loan summaries, extra charges, clause translations */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {translating && (
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "var(--border-radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--primary)",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <span>Translating analysis to {getLanguageName(language)}...</span>
                  </div>
                )}
                
                {/* Summaries */}
                <LoanSummaryCards
                  language={language}
                  summary={activeAnalysis.summary}
                />

                {/* Charges */}
                <ChargesDetector
                  language={language}
                  charges={activeAnalysis.hidden_charges}
                />

                {/* Legal Clause Simplifications */}
                <ClauseExplainer
                  language={language}
                  clauses={activeAnalysis.simplified_clauses}
                  dictionary={activeAnalysis.dictionary}
                />
              </div>
            </div>
            )
          )}

          {/* LOAN APPROVAL PREDICTOR PANEL */}
          {activeTab === "predictor" && (
            <PredictorSection
              language={language}
              authToken={token}
              apiBaseUrl={API_BASE_URL}
            />
          )}

          {/* COMPARE PANEL */}
          {activeTab === "compare" && (
            <CompareSection
              language={language}
              authToken={token}
              apiBaseUrl={API_BASE_URL}
            />
          )}

          {/* FINANCIAL GLOSSARY PANEL */}
          {activeTab === "dictionary" && (
            <DictionarySection
              language={language}
              extractedDictionary={activeAnalysis ? activeAnalysis.dictionary : []}
            />
          )}

          {/* CHATBOT PANEL */}
          {activeTab === "chatbot" && activeAnalysis && (
            <ChatbotSection
              language={language}
              authToken={token}
              analysisContext={getChatContextString()}
              apiBaseUrl={API_BASE_URL}
            />
          )}

          {/* REPORT HISTORY PANEL */}
          {activeTab === "history" && (
            <div className="glass-panel animated-fade" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={22} color="var(--primary)" />
                {text.history}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                Review previous loan documents analyzed on your account.
              </p>

              {historyLoading ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{text.loading}</p>
              ) : historyList.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No previous analyses found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {historyList.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => loadHistoricalAnalysis(item)}
                      style={{
                        padding: "16px",
                        borderRadius: "var(--border-radius-md)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--glass-border)",
                        cursor: "pointer",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px"
                      }}
                      className="glass-panel-hover"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <FileText size={20} color="var(--primary)" />
                        <div>
                          <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)" }}>{item.filename}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {text.date}: {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", fontWeight: "700" }}>{item.loan_amount}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.interest_rate} APR</p>
                        </div>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          color: item.risk_score > 60 ? "var(--danger)" : item.risk_score > 30 ? "var(--warning)" : "var(--success)",
                          backgroundColor: item.risk_score > 60 ? "rgba(239, 68, 68, 0.1)" : item.risk_score > 30 ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)"
                        }}>
                          Risk: {item.risk_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
