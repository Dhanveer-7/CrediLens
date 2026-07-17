import React from "react";
import { Scale } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface Clause {
  original_clause: string;
  simplified_explanation: string;
  risk_level: string;
}

interface Term {
  term: string;
  definition: string;
}

interface ClauseExplainerProps {
  language: Language;
  clauses: Clause[];
  dictionary: Term[];
}

export const ClauseExplainer: React.FC<ClauseExplainerProps> = ({
  language,
  clauses,
  dictionary,
}) => {
  const text = UI_LOCALIZATION[language];

  // Helper to highlight dictionary terms in the simplified text
  const renderHighlightedText = (content: string) => {
    if (!dictionary || dictionary.length === 0) return content;

    let tempText = content;
    const sortedTerms = [...dictionary].sort((a, b) => b.term.length - a.term.length);
    const replacements: { [key: string]: Term } = {};

    sortedTerms.forEach((dictItem, idx) => {
      // Escape special regex characters
      const escapedTerm = dictItem.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      // Find term matches (case-insensitive, word boundary)
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, "gi");
      const placeholder = `___TERM_PLACEHOLDER_${idx}___`;

      if (regex.test(tempText)) {
        replacements[placeholder] = dictItem;
        // Keep the casing of the original word in document
        tempText = tempText.replace(regex, (match) => {
          replacements[placeholder] = { ...dictItem, term: match };
          return placeholder;
        });
      }
    });

    // Replace placeholders with HTML spans
    let html = tempText;
    Object.keys(replacements).forEach((placeholder) => {
      const item = replacements[placeholder];
      html = html.replaceAll(
        placeholder,
        `<span class="term-highlight" data-definition="${item.definition.replace(
          /"/g,
          "&quot;"
        )}">${item.term}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="glass-panel animated-fade" style={{ padding: "24px" }}>
      <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <Scale size={20} color="var(--primary)" />
          {text.clauseTitle}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          {text.clauseDesc}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {clauses.map((clause, index) => {
          let badgeColor = "var(--success)";
          let badgeBg = "rgba(16, 185, 129, 0.1)";
          if (clause.risk_level?.toLowerCase() === "medium" || clause.risk_level?.toLowerCase() === "moderate") {
            badgeColor = "var(--warning)";
            badgeBg = "rgba(245, 158, 11, 0.1)";
          } else if (clause.risk_level?.toLowerCase() === "high") {
            badgeColor = "var(--danger)";
            badgeBg = "rgba(239, 68, 68, 0.1)";
          }

          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                paddingBottom: "24px",
                borderBottom: index < clauses.length - 1 ? "1px solid var(--glass-border)" : "none",
              }}
            >
              {/* Row Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Clause #{index + 1}
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: badgeColor,
                  backgroundColor: badgeBg,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase"
                }}>
                  {text.risk}: {clause.risk_level}
                </span>
              </div>

              {/* Grid split-view */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
              }} className="clause-grid-split">
                <style>{`
                  @media (min-width: 768px) {
                    .clause-grid-split {
                      grid-template-columns: 1fr 1fr !important;
                    }
                  }
                `}</style>
                
                {/* Left: Original Jargon */}
                <div style={{
                  backgroundColor: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "16px",
                }}>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    textTransform: "uppercase"
                  }}>
                    {text.originalClause}
                  </p>
                  <p style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                    lineHeight: "1.5"
                  }}>
                    "{clause.original_clause}"
                  </p>
                </div>

                {/* Right: Simplified */}
                <div style={{
                  backgroundColor: "rgba(59, 130, 246, 0.02)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "16px",
                }}>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--primary)",
                    marginBottom: "8px",
                    textTransform: "uppercase"
                  }}>
                    {text.simplifiedClause}
                  </p>
                  <p style={{
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    fontWeight: "500",
                    lineHeight: "1.5"
                  }}>
                    {renderHighlightedText(clause.simplified_explanation)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
