import os

app_path = r"c:\Users\Dhanveer\OneDrive\Desktop\CrediLens\frontend\src\App.tsx"

if os.path.exists(app_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject functions before handleLogout
    old_logout = "  const handleLogout = () => {"
    new_functions = """  const sendGoogleToken = async (credential: string) => {
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
      alert("No Google Client ID configured in App.tsx. Simulating Google Login via a mock OAuth profile...");
      sendGoogleToken("mock_google_credential");
    }
  };

  const handleLogout = () => {"""

    content = content.replace(old_logout, new_functions)

    # 2. Inject Google Button in JSX
    old_btn = """            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px" }}>"""

    new_btn = """            </button>
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

          <div style={{ textAlign: "center", marginTop: "24px" }}>"""

    content = content.replace(old_btn, new_btn)

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated App.tsx with Google Sign-In button and hooks.")
else:
    print("Error: App.tsx not found.")
