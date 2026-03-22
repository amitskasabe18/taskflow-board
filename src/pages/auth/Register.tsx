import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthContext } from "@/contexts/AuthContext";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [organisationUuid, setOrganisationUuid] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.organisationUuid) setOrganisationUuid(location.state.organisationUuid);
    if (location.state?.organisationName) setOrganisationName(location.state.organisationName);
    if (!location.state?.verified) {
      toast.error("Please verify your email first");
      navigate('/auth/send-otp');
    }
  }, [location.state, navigate]);

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strength];

  const validateForm = () => {
    const errors: string[] = [];
    if (!firstName.trim()) errors.push("First name is required");
    if (!lastName.trim()) errors.push("Last name is required");
    if (!email.trim()) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    if (password.length < 6) errors.push("Password must be at least 6 characters");
    if (password !== confirmPassword) errors.push("Passwords do not match");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) errors.push("Please enter a valid email address");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) { errors.forEach(error => toast.error(error)); return; }

    setIsLoading(true);
    try {
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      };
      if (organisationUuid) payload.organisation_uuid = organisationUuid;

      const response = await api.post('/api/v1/users/auth/register', payload);

      if (response.data.success || response.status === 200) {
        toast.success("Account created! Welcome aboard.");
        const loginResponse = await api.post('/api/v1/users/auth/login', { email: email.trim(), password });
        if (loginResponse.data.success || loginResponse.status === 200) {
          const token = loginResponse.data.data.token;
          const loginSuccess = await login(token);
          if (loginSuccess) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/auth/login', { state: { email: email.trim() } });
          }
        } else {
          navigate('/auth/login', { state: { email: email.trim() } });
        }
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/create-organization', { state: { verified: true, email } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .reg-root {
          min-height: 100vh;
          background: #050810;
          display: flex;
          font-family: 'Sora', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .reg-root::before {
          content: '';
          position: fixed;
          top: -20%; left: -10%;
          width: 60%; height: 70%;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .reg-root::after {
          content: '';
          position: fixed;
          bottom: -20%; right: -10%;
          width: 55%; height: 65%;
          background: radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* Left panel */
        .reg-left {
          position: relative; z-index: 1;
          flex: 0 0 500px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 48px 56px;
          border-right: 1px solid rgba(255,255,255,0.04);
          overflow-y: auto;
        }

        /* Right panel */
        .reg-right {
          position: relative; z-index: 1;
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 60px; overflow: hidden;
        }
        .reg-right-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%);
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb-1 { width: 320px; height: 320px; background: rgba(99,102,241,0.15); top: 10%; left: 20%; }
        .orb-2 { width: 240px; height: 240px; background: rgba(16,185,129,0.10); bottom: 15%; right: 15%; animation-delay: -4s; }
        .orb-3 { width: 180px; height: 180px; background: rgba(251,146,60,0.08); top: 50%; left: 50%; animation-delay: -2s; }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Brand */
        .brand-mark {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
        }
        .brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .brand-icon svg { width: 18px; height: 18px; color: white; }
        .brand-name { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: -0.01em; }

        /* Heading */
        .reg-heading {
          font-size: 28px; font-weight: 700; color: #fff;
          line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 6px;
        }
        .reg-subheading { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 8px; }

        /* Org badge */
        .org-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 12px; font-weight: 500; color: #a5b4fc;
          margin-bottom: 28px; width: fit-content;
        }
        .org-badge svg { width: 13px; height: 13px; opacity: 0.7; }
        .org-badge-role {
          font-size: 11px; color: rgba(255,255,255,0.25);
          padding-left: 8px; border-left: 1px solid rgba(255,255,255,0.1);
        }

        /* Form */
        .reg-form { display: flex; flex-direction: column; gap: 16px; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 11px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .field-wrap {
          position: relative; border-radius: 12px;
          transition: box-shadow 0.2s ease;
        }
        .field-wrap.is-focused {
          box-shadow: 0 0 0 1px rgba(99,102,241,0.6), 0 0 20px rgba(99,102,241,0.1);
        }
        .field-input {
          width: 100%; height: 46px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.9);
          font-size: 14px; font-family: 'Sora', sans-serif;
          padding: 0 16px; outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input.with-icon { padding-left: 44px; }
        .field-input.with-action { padding-right: 44px; }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99,102,241,0.5);
        }
        .field-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.22); pointer-events: none;
          transition: color 0.2s;
        }
        .field-wrap.is-focused .field-icon { color: rgba(99,102,241,0.65); }
        .field-action {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.22); padding: 0;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .field-action:hover { color: rgba(255,255,255,0.55); }

        /* Password strength */
        .strength-row {
          display: flex; align-items: center; gap: 8px; margin-top: -8px;
        }
        .strength-bars {
          display: flex; gap: 3px; flex: 1;
        }
        .strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s ease;
        }
        .strength-text {
          font-size: 11px; font-weight: 500;
          min-width: 60px; text-align: right;
          transition: color 0.3s;
        }

        /* Match indicator */
        .match-indicator {
          font-size: 11px; margin-top: -8px;
          display: flex; align-items: center; gap: 5px;
        }

        /* Submit */
        .submit-btn {
          width: 100%; height: 50px;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          border: none; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          letter-spacing: -0.01em;
          position: relative; overflow: hidden;
          margin-top: 4px;
        }
        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
          border-radius: 12px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Back button */
        .back-btn {
          width: 100%; height: 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 500;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .back-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.14);
        }
        .back-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .reg-footer {
          text-align: center; font-size: 12px;
          color: rgba(255,255,255,0.28); margin-top: 4px;
        }
        .reg-footer button {
          background: none; border: none; cursor: pointer;
          color: #818cf8; font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 500; padding: 0;
          transition: color 0.2s;
        }
        .reg-footer button:hover { color: #a5b4fc; text-decoration: underline; }

        /* Right panel content */
        .feature-panel {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; gap: 20px;
          max-width: 400px;
        }
        .badge-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px; padding: 6px 14px;
          font-size: 12px; font-weight: 500; color: #a5b4fc;
          letter-spacing: 0.04em; width: fit-content;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366f1; box-shadow: 0 0 8px rgba(99,102,241,0.8);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        .feature-heading {
          font-size: 36px; font-weight: 700;
          color: rgba(255,255,255,0.92);
          line-height: 1.15; letter-spacing: -0.04em;
        }
        .feature-heading span { color: #818cf8; }
        .feature-desc {
          font-size: 14px; color: rgba(255,255,255,0.33);
          line-height: 1.75; font-weight: 300;
        }
        .steps-list { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }
        .step-item {
          display: flex; align-items: flex-start; gap: 12px;
        }
        .step-num {
          width: 24px; height: 24px; min-width: 24px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: #818cf8;
          font-family: 'JetBrains Mono', monospace;
        }
        .step-text { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; padding-top: 3px; }
        .step-text strong { color: rgba(255,255,255,0.7); font-weight: 500; }

        @media (max-width: 960px) {
          .reg-right { display: none; }
          .reg-left { flex: 1; padding: 40px 32px; }
        }
      `}</style>

      <div className="reg-root">
        {/* Left: Form */}
        <div className="reg-left">
          <div className="brand-mark">
            <div className="brand-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 12l-4-4 1.4-1.4L9 9.2l6.6-6.6L17 4l-8 8z"/>
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z"/>
              </svg>
            </div>
            <span className="brand-name">Workspace</span>
          </div>

          <h1 className="reg-heading">Create your account</h1>
          <p className="reg-subheading">Fill in your details to get started</p>

          {organisationName && (
            <div className="org-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11"/>
              </svg>
              {organisationName}
              <span className="org-badge-role">Admin</span>
            </div>
          )}

          <form className="reg-form" onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">First Name</label>
                <div className={`field-wrap ${focused === 'firstName' ? 'is-focused' : ''}`}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setFocused('firstName')}
                    onBlur={() => setFocused(null)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Last Name</label>
                <div className={`field-wrap ${focused === 'lastName' ? 'is-focused' : ''}`}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setFocused('lastName')}
                    onBlur={() => setFocused(null)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className={`field-wrap ${focused === 'email' ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 8l10 7 10-7"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input with-icon"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  readOnly
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className={`field-wrap ${focused === 'password' ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="field-input with-icon with-action"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <div className="strength-row">
                <div className="strength-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColor : undefined }} />
                  ))}
                </div>
                <span className="strength-text" style={{ color: strength > 0 ? strengthColor : 'rgba(255,255,255,0.2)' }}>
                  {strengthLabel}
                </span>
              </div>
            )}

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div className={`field-wrap ${focused === 'confirm' ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="field-input with-icon with-action"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button type="button" className="field-action" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password match */}
            {confirmPassword.length > 0 && (
              <div className="match-indicator" style={{ color: password === confirmPassword ? '#22c55e' : '#ef4444' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {password === confirmPassword
                    ? <path d="M5 13l4 4L19 7"/>
                    : <path d="M6 18L18 6M6 6l12 12"/>
                  }
                </svg>
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}

            {/* Buttons */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                : <>Create Account</>
              }
            </button>

            <button type="button" className="back-btn" onClick={handleBack} disabled={isLoading}>
              <ArrowLeft size={14} /> Back
            </button>

            <div className="reg-footer">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/auth/login')}>Sign in</button>
            </div>
          </form>
        </div>

        {/* Right: Visual panel */}
        <div className="reg-right">
          <div className="reg-right-grid"/>
          <div className="orb orb-1"/>
          <div className="orb orb-2"/>
          <div className="orb orb-3"/>

          <div className="feature-panel">
            <div className="badge-chip">
              <span className="badge-dot"/>
              Quick setup — 2 minutes
            </div>
            <h2 className="feature-heading">
              Get started<br/>
              in <span>seconds</span>,<br/>
              not hours.
            </h2>
            <p className="feature-desc">
              Your account gives you instant access to projects, teams, and everything you need to ship faster.
            </p>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-num">1</span>
                <span className="step-text"><strong>Create your account</strong> — set your name and credentials</span>
              </div>
              <div className="step-item">
                <span className="step-num">2</span>
                <span className="step-text"><strong>Set up your workspace</strong> — invite your team in one click</span>
              </div>
              <div className="step-item">
                <span className="step-num">3</span>
                <span className="step-text"><strong>Start building</strong> — create your first project board</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;