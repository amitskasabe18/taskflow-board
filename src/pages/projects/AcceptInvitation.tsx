import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";

const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link');
        return;
      }

      try {
        const response = await api.post(`/api/v1/projects/invitations/${token}/accept`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Invitation accepted successfully!');
          setProjectName(response.data.data?.project?.name || '');
          toast.success('Successfully joined the project!');
          
          // Redirect to projects page after 2 seconds
          setTimeout(() => {
            navigate('/projects');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Failed to accept invitation');
          toast.error(response.data.message || 'Failed to accept invitation');
        }
      } catch (error: any) {
        console.error('Accept invitation error:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to accept invitation. Please try again.';
        setStatus('error');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    acceptInvitation();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Project Invitation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your invitation...'}
            {status === 'success' && 'Invitation accepted!'}
            {status === 'error' && 'Invitation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Accepting your invitation...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  {message}
                </p>
                {projectName && (
                  <p className="text-sm text-muted-foreground">
                    You've been added to <span className="font-medium">{projectName}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Redirecting you to projects...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-red-600">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground">
                  The invitation link may be invalid, expired, or already used.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate('/projects')}
                >
                  View Projects
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
