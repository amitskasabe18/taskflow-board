import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/services/api"

const SendOtp = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error("Please enter your email address"); return }
    if (!validateEmail(email.trim())) { toast.error("Please enter a valid email address"); return }

    setIsLoading(true)
    try {
      const response = await api.post("/api/v1/users/auth/send-otp", { email: email.trim() })
      if (response.data.success || response.status === 200) {
        // Store email in sessionStorage temporarily (more secure than URL)
        sessionStorage.setItem('otp_email', email.trim())
        sessionStorage.setItem('otp_timestamp', Date.now().toString())
        
        toast.success("OTP sent to your email!")
        setSent(true)
        setTimeout(() => {
          navigate("/auth/verify-otp")
        }, 800)
      } else {
        toast.error(response.data.message || "Failed to send OTP")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Custom Properties for Light/Dark Mode */
        :root {
          /* Light Mode Colors */
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-tertiary: #94a3b8;
          --border-color: #e2e8f0;
          --border-subtle: #f1f5f9;
          --accent-primary: #6366f1;
          --accent-primary-hover: #5558e3;
          --accent-glow: rgba(99, 102, 241, 0.12);
          --accent-glow-hover: rgba(99, 102, 241, 0.25);
          --shadow-color: rgba(0, 0, 0, 0.1);
          --gradient-start: rgba(99, 102, 241, 0.05);
          --gradient-end: rgba(16, 185, 129, 0.03);
          --orb-1: rgba(99, 102, 241, 0.08);
          --orb-2: rgba(16, 185, 129, 0.06);
          --orb-3: rgba(251, 146, 60, 0.04);
          --success-color: #10b981;
          --success-bg: rgba(16, 185, 129, 0.12);
          --success-border: rgba(16, 185, 129, 0.25);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            /* Dark Mode Colors */
            --bg-primary: #050810;
            --bg-secondary: #0f172a;
            --bg-tertiary: #1e293b;
            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --text-tertiary: #64748b;
            --border-color: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.04);
            --accent-primary: #6366f1;
            --accent-primary-hover: #818cf8;
            --accent-glow: rgba(99, 102, 241, 0.12);
            --accent-glow-hover: rgba(99, 102, 241, 0.25);
            --shadow-color: rgba(0, 0, 0, 0.3);
            --gradient-start: rgba(99, 102, 241, 0.12);
            --gradient-end: rgba(16, 185, 129, 0.08);
            --orb-1: rgba(99, 102, 241, 0.15);
            --orb-2: rgba(16, 185, 129, 0.10);
            --orb-3: rgba(251, 146, 60, 0.08);
            --success-color: #10b981;
            --success-bg: rgba(16, 185, 129, 0.12);
            --success-border: rgba(16, 185, 129, 0.25);
          }
        }

        .otp-root {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          font-family: 'Sora', sans-serif;
          overflow: hidden;
          position: relative;
          transition: background-color 0.3s ease;
        }
        .otp-root::before {
          content: '';
          position: fixed; top: -20%; left: -10%;
          width: 60%; height: 70%;
          background: radial-gradient(ellipse, var(--gradient-start) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .otp-root::after {
          content: '';
          position: fixed; bottom: -20%; right: -10%;
          width: 55%; height: 65%;
          background: radial-gradient(ellipse, var(--gradient-end) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* LEFT PANEL */
        .otp-left {
          position: relative; z-index: 1;
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 60px; overflow: hidden;
        }
        .otp-left-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%);
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb-1 { width: 320px; height: 320px; background: var(--orb-1); top: 10%; left: 20%; }
        .orb-2 { width: 240px; height: 240px; background: var(--orb-2); bottom: 15%; right: 15%; animation-delay: -4s; }
        .orb-3 { width: 180px; height: 180px; background: var(--orb-3); top: 50%; left: 50%; animation-delay: -2s; }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Left content */
        .left-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          justify-content: space-between;
          height: 100%; max-width: 420px; width: 100%;
          padding: 8px 0;
        }
        .left-top { display: flex; flex-direction: column; gap: 20px; }

        .badge-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent-glow);
          border: 1px solid var(--accent-primary);
          border-radius: 100px; padding: 6px 14px;
          font-size: 12px; font-weight: 500; color: var(--accent-primary);
          letter-spacing: 0.04em; width: fit-content;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent-primary); box-shadow: 0 0 8px var(--accent-primary);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        .left-heading {
          font-size: 36px; font-weight: 700;
          color: var(--text-primary);
          line-height: 1.15; letter-spacing: -0.04em;
        }
        .left-heading span { color: var(--accent-primary); }
        .left-desc {
          font-size: 14px; color: var(--text-secondary);
          line-height: 1.75; font-weight: 300; max-width: 340px;
        }

        .feature-list { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .feature-item { display: flex; align-items: flex-start; gap: 12px; }
        .feature-icon-wrap {
          width: 32px; height: 32px; min-width: 32px;
          background: var(--accent-glow);
          border: 1px solid var(--accent-primary);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .feature-icon-wrap svg { width: 14px; height: 14px; color: var(--accent-primary); }
        .feature-text { display: flex; flex-direction: column; gap: 1px; padding-top: 3px; }
        .feature-title { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .feature-sub { font-size: 12px; color: var(--text-tertiary); }

        .left-footer { font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.02em; }

        /* RIGHT PANEL */
        .otp-right {
          position: relative; z-index: 1;
          flex: 0 0 480px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 56px;
          border-left: 1px solid var(--border-subtle);
        }

        /* Brand */
        .brand-mark {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 52px;
        }
        .brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .brand-icon svg { width: 18px; height: 18px; color: white; }
        .brand-logo {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }
        .brand-name { font-size: 15px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }

        /* Icon circle */
        .icon-circle {
          width: 48px; height: 48px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          transition: background 0.4s, border-color 0.4s;
          background: var(--accent-glow);
          border: 1px solid var(--accent-primary);
        }
        .icon-circle.is-sent {
          background: var(--success-bg);
          border-color: var(--success-color);
        }
        .icon-circle svg { width: 20px; height: 20px; }

        /* Heading */
        .otp-heading {
          font-size: 28px; font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.03em; margin-bottom: 6px; line-height: 1.2;
        }
        .otp-subheading {
          font-size: 13px; color: var(--text-tertiary);
          line-height: 1.65; margin-bottom: 32px; font-weight: 300;
        }
        .otp-subheading strong { color: var(--text-secondary); font-weight: 500; }

        /* Form */
        .otp-form { display: flex; flex-direction: column; gap: 16px; }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 11px; font-weight: 500;
          color: var(--text-tertiary);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .field-wrap {
          position: relative; border-radius: 12px;
          transition: box-shadow 0.2s ease;
        }
        .field-wrap.is-focused {
          box-shadow: 0 0 0 1px var(--accent-primary), 0 0 20px var(--accent-glow);
        }
        .field-input {
          width: 100%; height: 48px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px; font-family: 'Sora', sans-serif;
          padding: 0 16px 0 44px; outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: var(--text-tertiary); }
        .field-input:focus { background: var(--bg-tertiary); border-color: var(--accent-primary); }
        .field-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .field-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary); pointer-events: none;
          transition: color 0.2s;
        }
        .field-wrap.is-focused .field-icon { color: var(--accent-primary); }

        /* Submit */
        .submit-btn {
          width: 100%; height: 50px;
          border: none; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'Sora', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s, background 0.4s;
          letter-spacing: -0.01em; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
        }
        .submit-btn.is-sent {
          background: linear-gradient(135deg, #059669, #10b981);
          box-shadow: 0 4px 24px rgba(16,185,129,0.35);
        }
        .submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 12px; }
        .divider-line { flex: 1; height: 1px; background: var(--border-color); }
        .divider-text { font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.05em; }

        /* Footer */
        .otp-footer { text-align: center; font-size: 12px; color: var(--text-tertiary); }
        .otp-footer a { color: var(--accent-primary); font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .otp-footer a:hover { color: var(--accent-primary-hover); text-decoration: underline; }

        .register-image-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .register-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          object-fit: contain;
        }

        @media (max-width: 900px) {
          .otp-left { display: none; }
          .otp-right { flex: 1; padding: 40px 32px; }
        }
      `}</style>

      <div className="otp-root">

        {/* LEFT: Visual panel */}
        <div className="otp-left">
          <div className="otp-left-grid" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          <div className="left-content">
            <div className="left-top">
              <h2 className="left-heading">
                Plan better,<br />
                <span>Ship</span> Faster.
              </h2>
              <p className="left-desc">
                Manage projects securely while keeping your workflow simple.
              </p>
              <div className="register-image-container">
                <img
                  src="/images/register_dark.png"
                  alt="Register illustration"
                />
              </div>

            </div>

            <p className="left-footer">© {new Date().getFullYear()} Workspace. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="otp-right">
          <div className="brand-mark">
            <div className="brand-icon">
              <img
                src="/images/logo/logo_light.png"
                alt="Workspace Logo"
                className="brand-logo"
              />
            </div>
            <span className="brand-name">Orbit</span>
          </div>

          <h1 className="otp-heading">
            {sent ? "Check your inbox" : "Verify your email"}
          </h1>
          <p className="otp-subheading">
            {sent
              ? <>We've sent a one-time code to <strong>{email}</strong>. Redirecting you now…</>
              : <>Enter your email and we'll send you a <strong>one-time password</strong> to continue.</>
            }
          </p>

          <form className="otp-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className={`field-wrap ${focused ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 7 10-7" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  disabled={isLoading || sent}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`submit-btn ${sent ? 'is-sent' : ''}`}
              disabled={isLoading || sent}
            >
              {isLoading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
              ) : sent ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  OTP Sent
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                  Send OTP
                </>
              )}
            </button>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">OR</span>
              <span className="divider-line" />
            </div>

            <div className="otp-footer">
              Already have an account?{" "}
              <Link to="/auth/login">Sign in</Link>
            </div>
          </form>
        </div>

      </div>
    </>
  )
}

export default SendOtp