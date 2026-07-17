import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface RiskMeterProps {
  language: Language;
  riskScore: number;
    keyRisks: string[];
  recommendations: string[];
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  language,
  riskScore,
  keyRisks,
  recommendations,
}) => {
  const [needleRotation, setNeedleRotation] = useState(-90); // starts at 0 score (-90 deg)
  const text = UI_LOCALIZATION[language];

  useEffect(() => {
    // Calculate rotation angle. 
    // 0 score corresponds to -90 degrees, 100 score corresponds to +90 degrees.
    const rotation = -90 + (riskScore / 100) * 180;
    // Animate needle after component loads
    const timer = setTimeout(() => {
      setNeedleRotation(rotation);
    }, 150);
    return () => clearTimeout(timer);
  }, [riskScore]);

  // Determine color theme based on score/level
  let themeColor = "var(--success)";
  let themeGlow = "var(--success-glow)";
  let levelText = text.safeLevel;
  let Icon = ShieldCheck;

  if (riskScore > 30 && riskScore <= 60) {
    themeColor = "var(--warning)";
    themeGlow = "var(--warning-glow)";
    levelText = text.modLevel;
    Icon = AlertTriangle;
  } else if (riskScore > 60) {
    themeColor = "var(--danger)";
    themeGlow = "var(--danger-glow)";
    levelText = text.highLevel;
    Icon = ShieldAlert;
  }

  return (
    <div className="glass-panel animated-fade" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon color={themeColor} size={20} />
          {text.riskTitle}
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        {/* Visual Dial */}
        <div className="risk-dial-container">
          <svg className="risk-dial-svg" viewBox="0 0 200 200">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored Segment Arc representing score */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={themeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.3"
              strokeDashoffset={251.3 - (riskScore / 100) * 251.3}
              style={{ transition: "stroke-dashoffset 1.5s ease-out-in" }}
            />
            {/* Center Pivot */}
            <circle cx="100" cy="100" r="6" fill={themeColor} />
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={themeColor}
              strokeWidth="4"
              strokeLinecap="round"
              className="risk-dial-needle"
              style={{ transform: `rotate(${needleRotation}deg)` }}
            />
          </svg>
          {/* Glowing score badge */}
          <div style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column"
          }}>
            <span style={{ fontSize: "28px", fontWeight: "800", color: themeColor, textShadow: `0 0 10px ${themeGlow}` }}>
              {riskScore}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              / 100
            </span>
          </div>
        </div>

        <p style={{ fontWeight: "700", fontSize: "16px", color: themeColor, marginTop: "12px" }}>
          {levelText}
        </p>
      </div>

      {/* Identified Risks */}
      {keyRisks && keyRisks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
            {text.keyRisksTitle}
          </h4>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {keyRisks.map((risk, index) => (
              <li key={index} style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--glass-border)", paddingTop: "16px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
            {text.recomTitle}
          </h4>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
