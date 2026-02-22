import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/AuthContext";
import { Key } from "lucide-react";
import { toast } from "sonner";

const JWTLogin = () => {
  const [token, setToken] = useState("");
  const { login, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error("Please enter a JWT token");
      return;
    }

    const success = await login(token.trim());
    
    if (success) {
      toast.success("Login successful with JWT!");
      navigate("/board");
    } else {
      toast.error("Invalid or expired JWT token");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">JWT Login</CardTitle>
          <CardDescription>
            Enter your JWT token to authenticate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">JWT Token</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter your JWT token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Key className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Login with JWT
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Where to get JWT tokens:</strong>
            </p>
            <ul className="text-left space-y-1 text-xs">
              <li>• From magic link email verification</li>
              <li>• From backend admin panel</li>
              <li>• From API authentication</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTLogin;
