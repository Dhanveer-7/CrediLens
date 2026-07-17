import React from "react";
import { AlertOctagon, HelpCircle, CheckCircle } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface Charge {
  charge_name: string;
  amount_or_rate: string;
  description: string;
  is_suspicious_or_unfair: boolean;
}

interface ChargesDetectorProps {
  language: Language;
  charges: Charge[];
}

export const ChargesDetector: React.FC<ChargesDetectorProps> = ({ language, charges }) => {
  const text = UI_LOCALIZATION[language];

  return (
    <div className="glass-panel animated-fade" style={{ padding: "24px" }}>
      <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{text.chargesTitle}</h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          {text.chargesDesc}
        </p>
      </div>

      {!charges || charges.length === 0 ? (
        <div style={{
          padding: "24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          color: "var(--success)"
        }}>
          <CheckCircle size={32} />
          <p style={{ fontWeight: "600" }}>{text.noChargesFound}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {charges.map((charge, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                borderRadius: "var(--border-radius-md)",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid",
                borderColor: charge.is_suspicious_or_unfair ? "rgba(245, 158, 11, 0.2)" : "var(--glass-border)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {charge.is_suspicious_or_unfair && (
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  height: "100%",
                  width: "4px",
                  backgroundColor: "var(--warning)"
                }} />
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {charge.is_suspicious_or_unfair ? (
                    <AlertOctagon size={18} color="var(--warning)" />
                  ) : (
                    <HelpCircle size={18} color="var(--text-muted)" />
                  )}
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {charge.charge_name}
                  </h4>
                </div>
                <span style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: charge.is_suspicious_or_unfair ? "var(--warning)" : "var(--primary)",
                  backgroundColor: charge.is_suspicious_or_unfair ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap"
                }}>
                  {charge.amount_or_rate}
                </span>
              </div>
              
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", paddingLeft: "26px" }}>
                {charge.description}
              </p>

              {charge.is_suspicious_or_unfair && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "var(--warning)",
                  paddingLeft: "26px",
                  marginTop: "4px"
                }}>
                  <span>{text.suspicious}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
