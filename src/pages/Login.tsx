import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { CheckCircle2, Zap, LayoutDashboard, Users, ArrowRight, Mail, LogIn } from "lucide-react";

const FEATURES = [
  { icon: LayoutDashboard, label: "Visual Kanban Boards", desc: "Drag-and-drop task management" },
  { icon: Users, label: "Team Collaboration", desc: "Real-time updates & comments" },
  { icon: Zap, label: "Smart Automations", desc: "Automate repetitive workflows" },
];

const MOCK_TASKS = [
  { title: "Design new dashboard UI", tag: "Design", color: "#6366f1", pct: 75 },
  { title: "API integration & testing", tag: "Dev", color: "#0ea5e9", pct: 40 },
  { title: "Q3 product roadmap", tag: "Strategy", color: "#f59e0b", pct: 90 },
  { title: "User research interviews", tag: "Research", color: "#10b981", pct: 55 },
];

const AVATARS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  useEffect(() => {
    if (location.state?.message) toast.info(location.state.message);
  }, [location.state]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: isDark ? "#0f1117" : "#f4f6fb",
      }}
    >
      {/* ── LEFT PANEL: Demo visual ── */}
      <div
        style={{
          flex: "1 1 55%",
          position: "relative",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
          overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        {/* Background blobs */}
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-100px", right: "-60px",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "40px", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(255,255,255,0.12)", borderRadius: "14px",
            padding: "10px 20px", marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.18)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #818cf8, #38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LayoutDashboard size={16} color="#fff" />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>
              Orbit
            </span>
          </div>
          <h2 style={{
            color: "#fff", fontSize: "clamp(22px, 2.5vw, 32px)",
            fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            Everything your team<br />needs to ship faster
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
            Join 12,000+ teams already using Orbit
          </p>
        </div>

        {/* Mock UI card */}
        <div style={{
          width: "100%", maxWidth: 400,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20, padding: "20px",
          backdropFilter: "blur(12px)",
          zIndex: 1, marginBottom: "32px",
        }}>
          {/* Board header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Sprint Board — Q3 2024</span>
            <div style={{ display: "flex", gap: -8 }}>
              {AVATARS.map((c, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: c, border: "2px solid #312e81",
                  marginLeft: i === 0 ? 0 : -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontWeight: 700,
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </div>

          {/* Task cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_TASKS.map((task, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "12px 14px",
                animation: `slideIn 0.4s ease ${i * 0.08}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500 }}>
                    {task.title}
                  </span>
                  <span style={{
                    background: task.color + "30", color: task.color,
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 20, border: `1px solid ${task.color}50`,
                  }}>
                    {task.tag}
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4 }}>
                  <div style={{
                    width: `${task.pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${task.color}, ${task.color}99)`,
                    borderRadius: 4,
                    transition: "width 1s ease",
                  }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4, display: "block" }}>
                  {task.pct}% complete
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, zIndex: 1, width: "100%", maxWidth: 400 }}>
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color="rgba(255,255,255,0.8)" />
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{desc}</div>
              </div>
              <CheckCircle2 size={16} color="#34d399" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth form ── */}
      <div style={{
        flex: "1 1 45%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 40px",
        background: isDark ? "#0f1117" : "#ffffff",
        position: "relative",
      }}>
        {/* Theme toggle */}
        <div style={{ position: "absolute", top: 24, right: 24 }}>
          <ThemeToggle />
        </div>

        {/* Mobile brand (shown only on small screens) */}
        <div className="md:hidden" style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontWeight: 800, fontSize: 22, color: isDark ? "#fff" : "#1e1b4b",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LayoutDashboard size={17} color="#fff" />
            </div>
            Orbit
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1 style={{
            fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800,
            color: isDark ? "#f1f5f9" : "#0f172a",
            letterSpacing: "-0.5px", margin: "0 0 8px",
          }}>
            Get started today
          </h1>
          <p style={{
            color: isDark ? "#64748b" : "#94a3b8",
            fontSize: 15, margin: "0 0 40px",
          }}>
            Sign in or create a free account
          </p>

          {/* Sign In Button */}
          <button
            onClick={() => navigate('/auth/login')}
            style={{
              width: "100%", height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #4f46e5, #2563eb)",
              color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, fontSize: 15, fontWeight: 700,
              fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(79,70,229,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
              marginBottom: 14,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(79,70,229,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(79,70,229,0.4)";
            }}
          >
            <LogIn size={18} />
            Sign In to your account
            <ArrowRight size={16} style={{ marginLeft: 4 }} />
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 14,
          }}>
            <div style={{ flex: 1, height: 1, background: isDark ? "#1e293b" : "#e2e8f0" }} />
            <span style={{ color: isDark ? "#475569" : "#94a3b8", fontSize: 12, fontWeight: 500 }}>
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: isDark ? "#1e293b" : "#e2e8f0" }} />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={() => navigate('/auth/signup')}
            style={{
              width: "100%", height: 52, borderRadius: 14,
              background: "transparent",
              color: isDark ? "#e2e8f0" : "#1e293b",
              border: `2px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, fontSize: 15, fontWeight: 700,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? "#1e293b" : "#f8fafc";
              (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "#334155" : "#cbd5e1";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "#1e293b" : "#e2e8f0";
            }}
          >
            <Mail size={18} />
            Create a free account
          </button>

          {/* Trust badges */}
          <div style={{
            marginTop: 36,
            padding: "16px 20px",
            background: isDark ? "#0d1117" : "#f8fafc",
            borderRadius: 14,
            border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 20, flexWrap: "wrap",
            }}>
              {[
                { icon: "🔒", text: "SOC 2 Compliant" },
                { icon: "⚡", text: "99.9% Uptime" },
                { icon: "🌍", text: "GDPR Ready" },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  color: isDark ? "#64748b" : "#94a3b8",
                  fontSize: 12, fontWeight: 500,
                }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 28, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
              {AVATARS.map((c, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: c, border: `2px solid ${isDark ? "#0f1117" : "#fff"}`,
                  marginLeft: i === 0 ? 0 : -10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "#fff", fontWeight: 700,
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <span style={{ marginLeft: 6, color: isDark ? "#94a3b8" : "#64748b", fontSize: 13 }}>
                +12,000 teams
              </span>
            </div>
            <p style={{ color: isDark ? "#475569" : "#94a3b8", fontSize: 12, margin: 0 }}>
              ★★★★★ Rated 4.9/5 by product teams worldwide
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: "absolute", bottom: 24,
          color: isDark ? "#334155" : "#cbd5e1",
          fontSize: 12,
        }}>
          © 2024 Orbit Board. All rights reserved.
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default Login;