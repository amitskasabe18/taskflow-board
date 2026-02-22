import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/v1/auth/verify-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Store user data and token
          if (data.data?.user && data.data?.token) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('token', data.data.token);
            
            toast.success('Registration completed successfully!');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/board');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium">Verifying your email...</p>
            <p className="text-sm text-gray-600">Please wait while we verify your registration.</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="text-lg font-medium text-green-600">Verification Successful!</p>
            <p className="text-sm text-gray-600 text-center">{message}</p>
            <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-600" />
            <p className="text-lg font-medium text-red-600">Verification Failed</p>
            <p className="text-sm text-gray-600 text-center">{message}</p>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/')}
              >
                Back to Login
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-600" />
            <p className="text-lg font-medium">Unknown Status</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' 
              ? 'Please wait while we verify your email address'
              : 'Email verification status'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
