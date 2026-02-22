import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get email from URL query parameter
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email in URL, redirect to send OTP page
      navigate('/auth/send-otp');
      toast.error("Email is required for OTP verification");
    }
  }, [searchParams, navigate]);

  const validateOtp = (otp: string) => {
    // OTP should be exactly 6 digits
    return /^\d{6}$/.test(otp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!validateOtp(otp.trim())) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/api/v1/users/auth/verify-otp', {
        email: email.trim(),
        otp: parseInt(otp.trim(), 10) // Convert to number as API expects
      });

      if (response.data.success || response.status === 200) {
        toast.success("OTP verified successfully!");
        // Navigate to organization creation page
        navigate('/auth/create-organization', { 
          state: { 
            email: email.trim(),
            verified: true 
          } 
        });
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Failed to verify OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    navigate('/auth/send-otp', { 
      state: { 
        email: email,
        message: "Please check your email for the new OTP" 
      } 
    });
  };

  const handleBack = () => {
    navigate('/auth/send-otp');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Verify OTP
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Display */}
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Email Address</Label>
              <p className="text-sm text-muted-foreground break-all">{email}</p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow digits
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                onClick={handleSubmit}
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the OTP? Check your spam folder or resend.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
