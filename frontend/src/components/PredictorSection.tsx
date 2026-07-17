import React, { useState } from "react";
import { Sparkles, Activity, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { type Language } from "../locale";

interface PredictorSectionProps {
  language: Language;
  authToken: string | null;
  apiBaseUrl: string;
}

interface PredictionResult {
  approval_probability: number;
  prediction: number;
  recommendations: string[];
}

const LOCAL_TEXTS = {
  en: {
    title: "Loan Approval AI Predictor",
    subtitle: "Estimate your approval probability using the Random Forest classifier trained on local credit data.",
    age: "Age (Years)",
    income: "Monthly Income (₹)",
    loanAmount: "Desired Loan Amount (₹)",
    creditScore: "Credit Score (300 - 850)",
    experience: "Work Experience (Years)",
    gender: "Gender",
    education: "Education Level",
    employment: "Employment Type",
    predictBtn: "Calculate Approval Probability",
    calculating: "Calculating odds...",
    resultTitle: "Prediction Analysis",
    resultDesc: "Approval Chance",
    approved: "Highly Likely Approved",
    rejected: "Low Approval Probability",
    recoms: "AI Financial Recommendations",
    male: "Male",
    female: "Female",
    bachelors: "Bachelor's Degree",
    highschool: "High School",
    masters: "Master's Degree",
    phd: "PhD",
    salaried: "Salaried Employee",
    selfemployed: "Self-Employed / Business",
    unemployed: "Unemployed",
    placeholder: "Submit the form to compute your AI credit score evaluation."
  },
  hi: {
    title: "ऋण स्वीकृति एआई भविष्यवक्ता",
    subtitle: "स्थानीय क्रेडिट डेटा पर प्रशिक्षित रैंडम फ़ॉरेस्ट क्लासिफायर का उपयोग करके अपनी स्वीकृति संभावना का अनुमान लगाएं।",
    age: "उम्र (वर्ष)",
    income: "मासिक आय (₹)",
    loanAmount: "वांछित ऋण राशि (₹)",
    creditScore: "क्रेडिट स्कोर (300 - 850)",
    experience: "कार्य अनुभव (वर्ष)",
    gender: "लिंग",
    education: "शिक्षा का स्तर",
    employment: "रोजगार का प्रकार",
    predictBtn: "स्वीकृति संभावना की गणना करें",
    calculating: "गणना की जा रही है...",
    resultTitle: "भविष्यवाणी विश्लेषण",
    resultDesc: "स्वीकृति की संभावना",
    approved: "अत्यधिक संभावित स्वीकृत",
    rejected: "कम स्वीकृति संभावना",
    recoms: "एआई वित्तीय सिफारिशें",
    male: "पुरुष",
    female: "महिला",
    bachelors: "स्नातक की उपाधि",
    highschool: "हाई स्कूल",
    masters: "परास्नातक की उपाधि",
    phd: "पीएचडी",
    salaried: "वेतनभोगी कर्मचारी",
    selfemployed: "स्व-नियोजित / व्यवसाय",
    unemployed: "बेरोजगार",
    placeholder: "अपने एआई क्रेडिट मूल्यांकन की गणना करने के लिए फॉर्म सबमिट करें।"
  },
  ta: {
    title: "கடன் ஒப்புதல் AI கணிப்பான்",
    subtitle: "உள்ளூர் கடன் தரவுகளில் பயிற்சி பெற்ற ரேண்டம் ஃபாரஸ்ட் வகைப்படுத்தியைப் பயன்படுத்தி உங்கள் ஒப்புதல் சாத்தியத்தை மதிப்பிடுங்கள்.",
    age: "வயது (ஆண்டுகள்)",
    income: "மாதாந்திர வருமானம் (₹)",
    loanAmount: "தேவைப்படும் கடன் தொகை (₹)",
    creditScore: "கிரெடிட் ஸ்கோர் (300 - 850)",
    experience: "பணி அனுபவம் (ஆண்டுகள்)",
    gender: "பாலினம்",
    education: "கல்வித் தகுதி",
    employment: "வேலை வகை",
    predictBtn: "ஒப்புதல் சாத்தியத்தை கணக்கிடு",
    calculating: "கணக்கிடப்படுகிறது...",
    resultTitle: "கணிப்பு பகுப்பாய்வு",
    resultDesc: "ஒப்புதல் வாய்ப்பு",
    approved: "ஒப்புதல் பெற அதிக வாய்ப்பு",
    rejected: "ஒப்புதல் பெற குறைந்த வாய்ப்பு",
    recoms: "AI நிதி பரிந்துரைகள்",
    male: "ஆண்",
    female: "பெண்",
    bachelors: "பட்டப்படிப்பு (Bachelors)",
    highschool: "பள்ளிப் படிப்பு (High School)",
    masters: "முதுகலை பட்டப்படிப்பு (Masters)",
    phd: "முனைவர் பட்டம் (PhD)",
    salaried: "மாதாந்திர சம்பளம் பெறுபவர்",
    selfemployed: "சுய தொழில் செய்பவர்",
    unemployed: "வேலையில்லாதவர்",
    placeholder: "உங்கள் AI கடன் மதிப்பீட்டைக் கணக்கிட படிவத்தை சமர்ப்பிக்கவும்."
  },
  te: {
    title: "రుణ ఆమోదం AI అంచనా సాధనం",
    subtitle: "స్థానిక క్రెడిట్ డేటాపై శిక్షణ పొందిన రాండమ్ ఫారెస్ట్ వర్గీకరణను ఉపయోగించి మీ రుణ ఆమోద సంభావ్యతను అంచనా వేయండి.",
    age: "వయస్సు (సంవత్సరాలు)",
    income: "నెలవారీ ఆదాయం (₹)",
    loanAmount: "కోరుకున్న రుణ మొత్తం (₹)",
    creditScore: "క్రెడిట్ స్కోర్ (300 - 850)",
    experience: "పని అనుభవం (సంవత్సరాలు)",
    gender: "లింగం",
    education: "విద్యా అర్హత",
    employment: "ఉద్యోగ రకం",
    predictBtn: "ఆమోద సంభావ్యతను లెక్కించండి",
    calculating: "లెక్కిస్తోంది...",
    resultTitle: "అంచనా విశ్లేషణ",
    resultDesc: "ఆమోద అవకాశం",
    approved: "ఆమోదించడానికి అధిక అవకాశం",
    rejected: "తక్కువ ఆమోద సంభావ్యత",
    recoms: "AI ఆర్థిక సిఫార్సులు",
    male: "పురుషుడు",
    female: "స్త్రీ",
    bachelors: "బ్యాచిలర్స్ డిగ్రీ",
    highschool: "హై స్కూల్",
    masters: "మాస్టర్స్ డిగ్రీ",
    phd: "పీహెచ్‌డీ",
    salaried: "జీతం పొందే ఉద్యోగి",
    selfemployed: "స్వయం ఉపాధి / వ్యాపారం",
    unemployed: "నిరుద్యోగి",
    placeholder: "మీ AI క్రెడిట్ మూల్యాంకనాన్ని లెక్కించడానికి ఫారమ్‌ను సమర్పించండి."
  },
  kn: {
    title: "ಸಾಲ ಅನುಮೋದನೆ AI ಮುನ್ಸೂಚಕ",
    subtitle: "ಸ್ಥಳೀಯ ಕ್ರೆಡಿಟ್ ಡೇಟಾದಲ್ಲಿ ತರಬೇತಿ ಪಡೆದ ರಾಂಡಮ್ ಫಾರೆಸ್ಟ್ ವರ್ಗೀಕರಣವನ್ನು ಬಳಸಿಕೊಂಡು ನಿಮ್ಮ ಸಾಲ ಅನುಮೋದನೆಯ ಸಾಧ್ಯತೆಯನ್ನು ಅಂದಾಜು ಮಾಡಿ.",
    age: "ವಯಸ್ಸು (ವರ್ಷಗಳು)",
    income: "ಮಾಸಿಕ ಆದಾಯ (₹)",
    loanAmount: "ಬಯಸಿದ ಸಾಲದ ಮೊತ್ತ (₹)",
    creditScore: "ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ (300 - 850)",
    experience: "ಕೆಲಸದ ಅನುಭವ (ವರ್ಷಗಳು)",
    gender: "ಲಿಂಗ",
    education: "ಶಿಕ್ಷಣದ ಮಟ್ಟ",
    employment: "ಉದ್ಯೋಗದ ವಿಧ",
    predictBtn: "ಅನುಮೋದನೆಯ ಸಾಧ್ಯತೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
    calculating: "ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",
    resultTitle: "ಮುನ್ಸೂಚನೆ ವಿಶ್ಲೇಷಣೆ",
    resultDesc: "ಅನುಮೋದನೆಯ ಸಾಧ್ಯತೆ",
    approved: "ಅನುಮೋದನೆ ಪಡೆಯುವ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆ",
    rejected: "ಅನುಮೋದನೆ ಪಡೆಯುವ ಕಡಿಮೆ ಸಾಧ್ಯತೆ",
    recoms: "AI ಹಣಕಾಸು ಶಿಫಾರಸುಗಳು",
    male: "ಪುರುಷ",
    female: "ಮಹಿಳೆ",
    bachelors: "ಬ್ಯಾಚುಲರ್ಸ್ ಪದವಿ",
    highschool: "ಹೈ ಸ್ಕೂಲ್",
    masters: "ಮಾಸ್ಟರ್ಸ್ ಪದವಿ",
    phd: "ಪಿಎಚ್‌ಡಿ",
    salaried: "ವೇತನ ಪಡೆಯುವ ನೌಕರ",
    selfemployed: "ಸ್ವಯಂ ಉದ್ಯೋಗಿ / ವ್ಯಾಪಾರ",
    unemployed: "ನಿರುದ್ಯೋಗಿ",
    placeholder: "ನಿಮ್ಮ AI ಕ್ರೆಡಿಟ್ ಮೌಲ್ಯಮಾಪನವನ್ನು ಲೆಕ್ಕಹಾಕಲು ಫಾರ್ಮ್ ಅನ್ನು ಸಲ್ಲಿಸಿ."
  },
  ml: {
    title: "ലോൺ അനുമതി AI പ്രവചന ഉപകരണം",
    subtitle: "പ്രാദേശിക ക്രെഡിറ്റ് ഡാറ്റയിൽ പരിശീലനം സിദ്ധിച്ച റാണ്ടം ഫോറസ്റ്റ് തരംതിരിക്കൽ ഉപയോഗിച്ച് നിങ്ങളുടെ ലോൺ അനുമതി ലഭിക്കാനുള്ള സാധ്യത വിലയിരുത്തുക.",
    age: "പ്രായം (വർഷങ്ങൾ)",
    income: "പ്രതിമാസ വരുമാനം (₹)",
    loanAmount: "ആവശ്യമായ ലോൺ തുക (₹)",
    creditScore: "ക്രെഡിറ്റ് സ്കോർ (300 - 850)",
    experience: "പ്രവൃത്തിപരിചയം (വർഷങ്ങൾ)",
    gender: "ലിംഗം",
    education: "വിദ്യാഭ്യാസ യോഗ്യത",
    employment: "തൊഴിൽ തരം",
    predictBtn: "അനുമതി സാധ്യത കണക്കാക്കുക",
    calculating: "കണക്കാക്കുന്നു...",
    resultTitle: "പ്രവചന വിശകലനം",
    resultDesc: "അനുമതി സാധ്യത",
    approved: "അനുമതി ലഭിക്കാൻ ഉയർന്ന സാധ്യത",
    rejected: "അനുമതി ലഭിക്കാൻ കുറഞ്ഞ സാധ്യത",
    recoms: "AI സാമ്പത്തിക ശുപാർശകൾ",
    male: "പുരുഷൻ",
    female: "സ്ത്രീ",
    bachelors: "ബിരുദം",
    highschool: "ഹൈസ്കൂൾ വിദ്യാഭ്യാസം",
    masters: "ബിരുദാനന്തര ബിരുദം",
    phd: "പിഎച്ച്ഡി",
    salaried: "ശമ്പളമുള്ള ജീവനക്കാരൻ",
    selfemployed: "സ്വയം തൊഴിൽ ചെയ്യുന്നയാൾ / ബിസിനസ്",
    unemployed: "തൊഴിലില്ലാത്തയാൾ",
    placeholder: "നിങ്ങളുടെ AI ക്രെഡിറ്റ് മൂല്യനിർണ്ണയം കണക്കാക്കാൻ ഫോം സമർപ്പിക്കുക."
  }
};

export const PredictorSection: React.FC<PredictorSectionProps> = ({ language, authToken, apiBaseUrl }) => {
  const t = LOCAL_TEXTS[language] || LOCAL_TEXTS.en;

  // Form states
  const [age, setAge] = useState<number>(32);
  const [income, setIncome] = useState<number>(65000);
  const [loanAmount, setLoanAmount] = useState<number>(180000);
  const [creditScore, setCreditScore] = useState<number>(710);
  const [experience, setExperience] = useState<number>(6);
  const [gender, setGender] = useState<string>("Male");
  const [education, setEducation] = useState<string>("Bachelors");
  const [employmentType, setEmploymentType] = useState<string>("Salaried");

  // API Call states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      age,
      income,
      loan_amount: loanAmount,
      credit_score: creditScore,
      years_experience: experience,
      gender,
      education,
      employment_type: employmentType
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/predict-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to calculate prediction result.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-fade" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Description */}
      <div className="glass-panel" style={{ padding: "24px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(165, 180, 252, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-gold)"
          }}>
            <Activity size={20} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800" }}>{t.title}</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
          {t.subtitle}
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px"
      }} className="predictor-split-grid">
        <style>{`
          @media (min-width: 1024px) {
            .predictor-split-grid { grid-template-columns: 1.2fr 1fr !important; }
          }
        `}</style>

        {/* Left Column - Input Form */}
        <div className="glass-panel" style={{ padding: "30px 24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">{t.age}</label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t.experience}</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="80"
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">{t.income}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={income}
                  onChange={(e) => setIncome(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t.loanAmount}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">{t.creditScore}</label>
                <input
                  type="number"
                  required
                  min="300"
                  max="850"
                  value={creditScore}
                  onChange={(e) => setCreditScore(parseInt(e.target.value) || 300)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t.gender}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-field select-field"
                  style={{ appearance: "none" }}
                >
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">{t.education}</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="input-field select-field"
                >
                  <option value="Bachelors">{t.bachelors}</option>
                  <option value="High School">{t.highschool}</option>
                  <option value="Masters">{t.masters}</option>
                  <option value="PhD">{t.phd}</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">{t.employment}</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="input-field select-field"
                >
                  <option value="Salaried">{t.salaried}</option>
                  <option value="Self-Employed">{t.selfemployed}</option>
                  <option value="Unemployed">{t.unemployed}</option>
                </select>
              </div>
            </div>

            {error && (
              <p style={{ color: "var(--danger)", fontSize: "13px", fontWeight: "500" }}>
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              <span>{loading ? t.calculating : t.predictBtn}</span>
              <ArrowRight size={16} />
            </button>

          </form>
        </div>

        {/* Right Column - Results Display */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!result ? (
            <div className="glass-panel" style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
              minHeight: "360px"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "var(--text-muted)"
              }}>
                <Sparkles size={24} />
              </div>
              <p style={{ fontSize: "14px", maxWidth: "260px", lineHeight: "1.6" }}>
                {t.placeholder}
              </p>
            </div>
          ) : (
            <div className="glass-panel animated-fade" style={{ padding: "30px 24px", display: "flex", flexDirection: "column", gap: "24px", flexGrow: 1 }}>
              
              {/* Radial Probability Gauge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
                  {t.resultDesc}
                </h4>
                
                {/* Circular Gauge */}
                <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={result.approval_probability >= 50 ? "var(--success)" : "var(--danger)"}
                      strokeWidth="12"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * result.approval_probability) / 100}
                      strokeLinecap="round"
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "80px 80px",
                        transition: "stroke-dashoffset 1s ease-in-out"
                      }}
                    />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "36px", fontWeight: "900", letterSpacing: "-0.03em" }}>
                      {result.approval_probability}%
                    </span>
                  </div>
                </div>

                {/* Prediction Result Tag */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  backgroundColor: result.prediction === 1 ? "rgba(5, 150, 105, 0.12)" : "rgba(225, 29, 72, 0.12)",
                  color: result.prediction === 1 ? "var(--success)" : "var(--danger)",
                  border: result.prediction === 1 ? "1px solid rgba(5, 150, 105, 0.2)" : "1px solid rgba(225, 29, 72, 0.2)"
                }}>
                  {result.prediction === 1 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>{result.prediction === 1 ? t.approved : t.rejected}</span>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{t.recoms}</span>
                </h4>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "4px" }}>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} style={{
                      fontSize: "13.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start"
                    }}>
                      <span style={{ color: "var(--accent-gold)", marginTop: "2px" }}>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
