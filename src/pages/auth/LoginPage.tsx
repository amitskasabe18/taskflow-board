import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthContext } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  useEffect(() => {
    // Check if we have email from registration
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    
    // Check if we have a success message
    if (location.state?.message) {
      toast.success(location.state.message);
    }
    
    // Check if we have a redirect message from ProtectedRoute
    if (location.state?.from) {
      toast.info(location.state.message || "Please login to access this page");
    }
  }, [location.state]);

  const validateForm = () => {
    const errors = [];
    
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
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email: email.trim() });
      const response = await api.post('/api/v1/users/auth/login', {
        email: email.trim(),
        password: password
      });

      console.log('Login response:', response);
      console.log('Login response data:', response.data);
      console.log('Login status:', response.status);

      if (response.data.success || response.status === 200) {
        // Use the login function from AuthContext to properly set user state
        const token = response.data.data.token;
        console.log('Token extracted:', token);
        
        const loginSuccess = await login(token);
        
        if (loginSuccess) {
          toast.success("Login successful! Welcome back.");
          
          // Navigate to board page
          navigate('/board', { 
            replace: true // Replace history so user can't go back to login
          });
        } else {
          toast.error("Failed to authenticate. Please try again.");
        }
      } else {
        const errorMessage = response.data?.message || response.data?.error || "Invalid credentials";
        console.log('Login error message:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/send-otp');
  };

  const handleOtpLogin = () => {
    navigate('/auth/send-otp');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Login
          </CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/auth/send-otp')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up with OTP
                </button>
              </p>
            </div>
          </form>
          <div className="text-center mt-2">
            <Link to="/" className="text-primary hover:underline font-medium">
              Back To Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
