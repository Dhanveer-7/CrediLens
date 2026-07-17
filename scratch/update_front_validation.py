import os

app_path = r"c:\Users\Dhanveer\OneDrive\Desktop\CrediLens\frontend\src\App.tsx"

if os.path.exists(app_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update imports to include AlertCircle
    old_imports = """import {
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
  Briefcase
} from "lucide-react";"""

    new_imports = """import {
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
  AlertCircle
} from "lucide-react";"""

    content = content.replace(old_imports, new_imports)

    # 2. Update dashboard rendering block to check is_valid_loan_document
    old_render = """          {/* DASHBOARD PANEL */}
          {activeTab === "dashboard" && activeAnalysis && (
            <div className="dashboard-grid">"""

    new_render = """          {/* DASHBOARD PANEL */}
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
              <div className="dashboard-grid">"""

    content = content.replace(old_render, old_render.replace('<div className="dashboard-grid">', '')) # Clear duplicate if already updated partially
    # Ensure a fresh replacement
    content = content.replace(old_render, new_render)
    
    # 3. Add closing parenthesis block to match the new ternary operation
    # In App.tsx:
    #             </div>
    #           </div>
    #         )
    #       )}
    # Let's check how the dashboard rendering block ends:
    #             </div>
    #           </div>
    #         )
    #       )}
    # The original was:
    #             </div>
    #           </div>
    #         )
    #       )}
    # Wait, the closing tag of the dashboard block is:
    #             </div>
    #           )
    #         )}
    # Let's inspect the target file or do a search.
    # In main App.tsx, the dashboard block was:
    #       {activeTab === "dashboard" && activeAnalysis && (
    #         <div className="dashboard-grid">
    #           ...
    #           </div>
    #         </div>
    #       )}
    # Since we replaced `<div className="dashboard-grid">` with `!activeAnalysis.is_valid_loan_document ? (...) : (<div className="dashboard-grid">`, we need to end it with:
    #           </div>
    #         )
    #       )}
    # So we replace the closing block:
    # Let's find it. The dashboard block ends right before comparing tab:
    #           </div>
    #         </div>
    #       )}
    #       
    #       {/* COMPARE PANEL */}
    # Let's search and replace this specific end block!
    
    old_end = """                {/* Legal Clause Simplifications */}
                <ClauseExplainer
                  language={language}
                  clauses={activeAnalysis.simplified_clauses}
                  dictionary={activeAnalysis.dictionary}
                />
              </div>
            </div>
          )}

          {/* COMPARE PANEL */}"""

    new_end = """                {/* Legal Clause Simplifications */}
                <ClauseExplainer
                  language={language}
                  clauses={activeAnalysis.simplified_clauses}
                  dictionary={activeAnalysis.dictionary}
                />
              </div>
            </div>
            )
          )}

          {/* COMPARE PANEL */}"""

    content = content.replace(old_end, new_end)

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated App.tsx rendering with document validation checks.")
else:
    print("Error: App.tsx not found.")
