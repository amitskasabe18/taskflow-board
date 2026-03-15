import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthContext } from "@/contexts/AuthContext";
import "./login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.message) toast.success(location.state.message);
    if (location.state?.from) toast.info(location.state.message || "Please login to access this page");
  }, [location.state]);

  const validateForm = () => {
    const errors: string[] = [];
    if (!email.trim()) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    if (password.length < 6) errors.push("Password must be at least 6 characters");
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
      const response = await api.post('/api/v1/users/auth/login', {
        email: email.trim(),
        password: password
      });

      if (response.data.success || response.status === 200) {
        const token = response.data.data.token;
        const loginSuccess = await login(token);
        if (loginSuccess) {
          toast.success("Welcome back.");
          navigate('/dashboard', { replace: true });
        } else {
          toast.error("Failed to authenticate. Please try again.");
        }
      } else {
        toast.error(response.data?.message || response.data?.error || "Invalid credentials");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
        {/* Left: Form */}
        <div className="login-left">
          {/* Brand */}
          <div className="brand-mark">
            <div className="brand-icon">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 12l-4-4 1.4-1.4L9 9.2l6.6-6.6L17 4l-8 8z"/><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z"/></svg>
            </div>
            <span className="brand-name">Workspace</span>
          </div>

          <h1 className="login-heading">Sign in to<br/>your account</h1>
          <p className="login-subheading">Enter your credentials to continue</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className={`field-wrap ${focused === 'email' ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 8l10 7 10-7"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className={`field-wrap ${focused === 'password' ? 'is-focused' : ''}`}>
                <span className="field-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="field-input has-action"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign In</>
              )}
            </button>

            <div className="divider">
              <span className="divider-line"/>
              <span className="divider-text">OR</span>
              <span className="divider-line"/>
            </div>

            <div className="login-footer">
              Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/auth/signup')}>
                Create one
              </button>
            </div>
          </form>
        </div>

        {/* Right: Visual panel */}
        <div className="login-right">
          <div className="login-right-grid"/>
          <div className="orb orb-1"/>
          <div className="orb orb-2"/>
          <div className="orb orb-3"/>

          <div className="feature-badge">
            <div className="badge-chip">
              <span className="badge-chip-dot"/>
              All systems operational
            </div>
            <h2 className="feature-heading">
              Your projects,<br/>
              <span>perfectly</span><br/>
              organized.
            </h2>
            <p className="feature-desc">
              A unified workspace for teams to plan, track, and deliver work — faster and with full clarity.
            </p>
            <div className="feature-stats">
              <div className="stat-item">
                <span className="stat-num">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">12k+</span>
                <span className="stat-label">Teams</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">SOC2</span>
                <span className="stat-label">Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;