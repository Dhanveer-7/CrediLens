import React, { useState, useRef } from "react";
import { Scale, Upload, AlertCircle, FileText, CheckCircle2, TrendingDown } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface CompareSectionProps {
  language: Language;
  authToken: string;
  apiBaseUrl: string;
}

export const CompareSection: React.FC<CompareSectionProps> = ({
  language,
  authToken,
  apiBaseUrl,
}) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any | null>(null);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  
  const text = UI_LOCALIZATION[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileNum: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileNum === 1) setFile1(file);
      else setFile2(file);
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError("Please upload both loan documents to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    setComparison(null);

    const formData = new FormData();
    formData.append("loan1", file1);
    formData.append("loan2", file2);

    try {
      const response = await fetch(`${apiBaseUrl}/api/compare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Comparison failed");
      }

      const data = await response.json();
      setComparison(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to compare files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonRow = (metricLabel: string, metricObj: any, isRisk = false) => {
    if (!metricObj) return null;
    return (
      <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <td style={{ padding: "16px", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)" }}>
          {metricLabel}
        </td>
        <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-primary)" }}>
          {isRisk ? (
            <span style={{
              fontWeight: "700",
              color: parseInt(metricObj.loan_1_value) > 60 ? "var(--danger)" : parseInt(metricObj.loan_1_value) > 30 ? "var(--warning)" : "var(--success)"
            }}>
              {metricObj.loan_1_value}
            </span>
          ) : metricObj.loan_1_value}
        </td>
        <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-primary)" }}>
          {isRisk ? (
            <span style={{
              fontWeight: "700",
              color: parseInt(metricObj.loan_2_value) > 60 ? "var(--danger)" : parseInt(metricObj.loan_2_value) > 30 ? "var(--warning)" : "var(--success)"
            }}>
              {metricObj.loan_2_value}
            </span>
          ) : metricObj.loan_2_value}
        </td>
        <td style={{ padding: "16px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          {metricObj.comparison_verdict}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animated-fade">
      {/* Description header */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <Scale size={24} color="var(--primary)" />
          {text.compareTitle}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
          {text.compareDesc}
        </p>
      </div>

      {/* Upload Zone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="compare-upload-grid">
        <style>{`
          @media (min-width: 768px) {
            .compare-upload-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
        
        {/* Loan A */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700" }}>{text.loanA}</h3>
          
          <input
            ref={fileInputRef1}
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => handleFileChange(e, 1)}
            style={{ display: "none" }}
          />

          <div
            onClick={() => fileInputRef1.current?.click()}
            style={{
              border: "2px dashed var(--glass-border)",
              borderRadius: "var(--border-radius-md)",
              padding: "32px 16px",
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.01)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}
            className="glass-panel-hover"
          >
            {file1 ? (
              <>
                <FileText size={32} color="var(--primary)" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px", whiteSpace: "nowrap" }}>
                  {file1.name}
                </span>
                <span style={{ fontSize: "11px", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={12} /> Ready
                </span>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{text.uploadFirst}</span>
              </>
            )}
          </div>
        </div>

        {/* Loan B */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700" }}>{text.loanB}</h3>
          
          <input
            ref={fileInputRef2}
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => handleFileChange(e, 2)}
            style={{ display: "none" }}
          />

          <div
            onClick={() => fileInputRef2.current?.click()}
            style={{
              border: "2px dashed var(--glass-border)",
              borderRadius: "var(--border-radius-md)",
              padding: "32px 16px",
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.01)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}
            className="glass-panel-hover"
          >
            {file2 ? (
              <>
                <FileText size={32} color="var(--primary)" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px", whiteSpace: "nowrap" }}>
                  {file2.name}
                </span>
                <span style={{ fontSize: "11px", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={12} /> Ready
                </span>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{text.uploadSecond}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleCompare}
          disabled={loading || !file1 || !file2}
          className="btn btn-primary"
          style={{ width: "200px", padding: "12px" }}
        >
          {loading ? (
            <>
              <style>{`
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
              <svg className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%" }} />
              <span>{text.comparing}</span>
            </>
          ) : (
            <>
              <Scale size={18} />
              <span>{text.compareBtn}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--border-radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "var(--danger)"
        }}>
          <AlertCircle size={20} />
          <p style={{ fontSize: "14px", fontWeight: "500" }}>{error}</p>
        </div>
      )}

      {/* Comparison results */}
      {comparison && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animated-fade">
          
          {/* Verdict Box */}
          <div className="glass-panel" style={{
            padding: "24px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            backgroundColor: "rgba(16, 185, 129, 0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingDown color="var(--success)" size={24} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--success)" }}>
                {text.overallVerdict}
              </h3>
            </div>
            
            <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
              {text.betterChoice}: <span style={{ color: "var(--success)", textShadow: "0 0 10px rgba(16,185,129,0.2)" }}>{comparison.better_choice}</span>
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {comparison.overall_verdict}
            </p>
          </div>

          {/* Table */}
          <div className="glass-panel" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "16px", fontSize: "13px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>{text.metricName}</th>
                  <th style={{ padding: "16px", fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase" }}>{comparison.loan_1_name || text.loanA}</th>
                  <th style={{ padding: "16px", fontSize: "13px", fontWeight: "700", color: "var(--accent-teal)", textTransform: "uppercase" }}>{comparison.loan_2_name || text.loanB}</th>
                  <th style={{ padding: "16px", fontSize: "13px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>{text.verdict}</th>
                </tr>
              </thead>
              <tbody>
                {renderComparisonRow(text.loanAmount, comparison.loan_amount)}
                {renderComparisonRow(text.interestRate, comparison.interest_rate)}
                {renderComparisonRow(text.processingFee, comparison.processing_fee)}
                {renderComparisonRow(text.estimatedEmi, comparison.estimated_emi)}
                {renderComparisonRow(text.chargesTitle, comparison.hidden_charges)}
                {renderComparisonRow("Total Repayment", comparison.total_repayment)}
                {renderComparisonRow(text.riskScore, comparison.risk_score, true)}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};
