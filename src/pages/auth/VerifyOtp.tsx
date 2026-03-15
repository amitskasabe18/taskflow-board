import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const VerifyOtp = () => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ---------------- THEME FIX ---------------- */
  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);
  /* ------------------------------------------- */

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      navigate("/auth/send-otp");
      toast.error("Email is required for OTP verification");
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const otp = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = [...digits];
      pasted.split("").forEach((ch, i) => {
        if (i < 6) next[i] = ch;
      });
      setDigits(next);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/users/auth/verify-otp", {
        email: email.trim(),
        otp: parseInt(otp, 10),
      });
      if (response.data.success || response.status === 200) {
        toast.success("OTP verified!");
        setVerified(true);
        setTimeout(() => {
          navigate("/auth/create-organization", {
            state: { email: email.trim(), verified: true },
          });
        }, 800);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to verify OTP."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    navigate("/auth/send-otp", { state: { email } });
  };

  const isFilled = otp.length === 6;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center relative overflow-hidden p-6">
      {/* Interesting background: subtle dot grid + floating geometric shapes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            document.documentElement.classList.contains("dark")
              ? "rgba(255,255,255,0.03) 1px, transparent 1px"
              : "rgba(0,0,0,0.03) 1px, transparent 1px"
          })`,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Floating shapes – no blur, just subtle color with opacity */}
      <div className="absolute top-[15%] left-[10%] w-32 h-32 border border-indigo-200/20 dark:border-indigo-500/10 rotate-12 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-40 h-40 border border-purple-200/20 dark:border-purple-500/10 -rotate-6 rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[25%] w-24 h-24 border border-emerald-200/20 dark:border-emerald-500/10 rotate-45 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-36 h-36 border border-amber-200/20 dark:border-amber-500/10 -rotate-12 rounded-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-3xl p-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {verified ? "Verified!" : "Enter your code"}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {verified ? "Redirecting you now…" : "We sent a 6-digit code to"}
        </p>

        {!verified && (
          <div className="mb-6 text-sm text-gray-700 dark:text-gray-300">
            {email}
          </div>
        )}

        {/* OTP INPUTS */}
        <div className="grid grid-cols-6 gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isLoading || verified}
              className="
                w-full aspect-square
                text-center text-xl font-mono
                border rounded-xl
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500
                outline-none
              "
            />
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || verified || !isFilled}
          className="
            w-full h-12 rounded-xl
            bg-indigo-600 dark:bg-indigo-500
            text-white font-semibold
            flex items-center justify-center gap-2
            disabled:opacity-50
          "
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying
            </>
          ) : verified ? (
            "Verified"
          ) : (
            "Verify Code"
          )}
        </button>

        {/* RESEND */}
        <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            className="text-indigo-600 dark:text-indigo-400 font-medium"
          >
            Resend code
          </button>
        </div>

        {/* INFO */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Check your spam folder if you don't see the email.  
          Codes expire after 10 minutes.
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;