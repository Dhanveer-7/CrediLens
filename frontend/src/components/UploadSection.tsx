import React, { useState, useRef } from "react";
import { Upload, AlertCircle, Loader } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface UploadSectionProps {
  language: Language;
  authToken: string;
  onAnalysisComplete: (data: any) => void;
  apiBaseUrl: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  language,
  authToken,
  onAnalysisComplete,
  apiBaseUrl,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const text = UI_LOCALIZATION[language];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || text.apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glass-panel animated-fade" style={{ padding: "40px 24px", textAlign: "center" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "800" }}>{text.uploadTitle}</h2>
      <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 32px auto", fontSize: "14px" }}>
        {text.uploadDesc}
      </p>

      {loading ? (
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Loader className="animate-spin" size={48} color="var(--primary)" />
          <p style={{ fontWeight: "600", color: "var(--text-primary)" }}>{text.analyzing}</p>
          <div style={{ width: "100%", maxWidth: "300px", height: "4px", backgroundColor: "var(--bg-tertiary)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute",
              height: "100%",
              width: "50%",
              backgroundColor: "var(--primary)",
              borderRadius: "2px",
              animation: "shimmer 1.5s infinite ease-in-out"
            }} />
          </div>
          <style>{`
            @keyframes shimmer {
              0% { left: -50%; }
              100% { left: 100%; }
            }
            .animate-spin {
              animation: spin 2s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          style={{
            border: isDragActive ? "2px dashed var(--primary)" : "2px dashed var(--glass-border)",
            borderRadius: "var(--border-radius-lg)",
            padding: "48px 24px",
            backgroundColor: isDragActive ? "rgba(59, 130, 246, 0.05)" : "rgba(255, 255, 255, 0.01)",
            cursor: "pointer",
            transition: "var(--transition-smooth)",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}
          className="glass-panel-hover"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            marginBottom: "8px"
          }}>
            <Upload size={32} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontWeight: "600", fontSize: "16px" }}>
              {text.dragDrop} <span style={{ color: "var(--primary)", textDecoration: "underline" }}>{text.browse}</span>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              {text.supportFormats} (Max 10MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: "24px",
          padding: "12px 16px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--border-radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "var(--danger)",
          textAlign: "left"
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "14px", fontWeight: "500" }}>{error}</p>
        </div>
      )}
    </div>
  );
};
