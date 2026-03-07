import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthContext } from "@/contexts/AuthContext";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [organisationUuid, setOrganisationUuid] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  useEffect(() => {
    // Check if we have email from previous step
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.organisationUuid) {
      setOrganisationUuid(location.state.organisationUuid);
    }
    if (location.state?.organisationName) {
      setOrganisationName(location.state.organisationName);
    }
    
    // Check if user is verified (either from org creation or individual signup)
    if (!location.state?.verified) {
      toast.error("Please verify your email first");
      navigate('/auth/send-otp');
    }
  }, [location.state, navigate]);

  const validateForm = () => {
    const errors = [];
    
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
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);
    
    try {
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password,
      };

      // Only include organisation_uuid if it exists
      if (organisationUuid) {
        payload.organisation_uuid = organisationUuid;
      }

      const response = await api.post('/api/v1/users/auth/register', payload);

      if (response.data.success || response.status === 200) {
        toast.success("Registration successful! Welcome to TaskFlow!");
        
        // Automatically log in the user after successful registration
        const loginResponse = await api.post('/api/v1/users/auth/login', {
          email: email.trim(),
          password: password
        });
        
        if (loginResponse.data.success || loginResponse.status === 200) {
          const token = loginResponse.data.data.token;
          const loginSuccess = await login(token);
          
          if (loginSuccess) {
            // Navigate to project board page directly after successful login
            navigate('/9ec18e8a-8fe2-4b35-9149-0b8aeacab015/board', { 
              replace: true 
            });
          } else {
            toast.error("Registration successful but login failed. Please try logging in manually.");
            navigate('/auth/login', { 
              state: { 
                email: email.trim()
              } 
            });
          }
        } else {
          toast.error("Registration successful but auto-login failed. Please try logging in manually.");
          navigate('/auth/login', { 
            state: { 
              email: email.trim()
            } 
          });
        }
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // If user has org, go back to org creation. Otherwise go to create org page
    if (organisationUuid) {
      navigate('/auth/create-organization', { 
        state: { 
          verified: true, 
          email 
        } 
      });
    } else {
      navigate('/auth/create-organization', { 
        state: { 
          verified: true, 
          email 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Create Account
          </CardTitle>
          <CardDescription>
            {organisationName ? (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{organisationName}</span>
                <span className="text-xs text-muted-foreground">(You'll be the admin)</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-2">
                Registering as an individual user
              </div>
            )}
            Complete your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Fields */}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <Button 
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to OTP
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
