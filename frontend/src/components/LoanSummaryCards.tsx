import React from "react";
import { DollarSign, Percent, Briefcase, Calendar, CreditCard } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface LoanSummaryCardsProps {
  language: Language;
  summary: {
    loan_amount: string;
    interest_rate: string;
    processing_fee: string;
    loan_duration: string;
    estimated_emi: string;
  };
}

export const LoanSummaryCards: React.FC<LoanSummaryCardsProps> = ({ language, summary }) => {
  const text = UI_LOCALIZATION[language];

  const cards = [
    {
      title: text.loanAmount,
      value: summary.loan_amount || "N/A",
      icon: DollarSign,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: text.interestRate,
      value: summary.interest_rate || "N/A",
      icon: Percent,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: text.processingFee,
      value: summary.processing_fee || "N/A",
      icon: Briefcase,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: text.tenure,
      value: summary.loan_duration || "N/A",
      icon: Calendar,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: text.estimatedEmi,
      value: summary.estimated_emi || "N/A",
      icon: CreditCard,
      color: "#ec4899",
      bgColor: "rgba(236, 72, 153, 0.1)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{text.summaryTitle}</h3>
      <div className="summary-cards-container">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="glass-panel animated-fade"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--border-radius-md)",
                  backgroundColor: card.bgColor,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconComponent size={24} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
                  {card.title}
                </span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
