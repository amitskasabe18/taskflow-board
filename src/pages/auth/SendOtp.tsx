import { useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const SendOtp = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/api/v1/users/auth/send-otp', {
        email: email.trim()
      });

      if (response.data.success || response.status === 200) {
        toast.success("OTP sent successfully to your email!");
        // Navigate to verify OTP page with email as query param
        navigate(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}`);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Send OTP
          </CardTitle>
          <CardDescription>
            Enter your email address to receive a one-time password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>
          </form>
          <div className="text-center mt-2">
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendOtp;
