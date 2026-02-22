import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const EmailSent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(30);
  
  const { email, message, isRegistration } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOpenEmail = () => {
    const emailProviders = [
      { domain: 'gmail.com', url: 'https://mail.google.com' },
      { domain: 'yahoo.com', url: 'https://mail.yahoo.com' },
      { domain: 'outlook.com', url: 'https://outlook.live.com' },
      { domain: 'hotmail.com', url: 'https://outlook.live.com' },
    ];

    const provider = emailProviders.find(p => email?.includes(p.domain));
    const emailUrl = provider?.url || `https://${email?.split('@')[1]}`;

    window.open(emailUrl, '_blank');
  };

  const handleResend = async () => {
    // Navigate back to login with email pre-filled
    navigate('/', { state: { email, resend: true } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Check Your Email
          </CardTitle>
          <CardDescription>
            {message || "We've sent a magic link to your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              We sent an email to:
            </p>
            <p className="font-medium text-lg">{email}</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleOpenEmail}
              className="w-full"
              variant="default"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Email App
            </Button>
            
            <Button 
              onClick={handleResend}
              className="w-full"
              variant="outline"
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              {isRegistration 
                ? "Your account has been created. Click the link in the email to complete login."
                : "Click the magic link in the email to sign in automatically."
              }
            </p>
            <p className="mt-1">
              The link will expire in 15 minutes for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSent;
