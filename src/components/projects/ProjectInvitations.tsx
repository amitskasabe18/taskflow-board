import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { format } from "date-fns";

interface Invitation {
  uuid: string;
  token: string;
  project: {
    uuid: string;
    name: string;
    description: string;
  };
  role: string;
  invited_by: string;
  invited_by_email: string;
  expires_at: string;
  created_at: string;
}

export const ProjectInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await api.get("/api/v1/projects/invitations/my");
      if (response.data.success) {
        setInvitations(response.data.data.invitations);
      }
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token: string, projectName: string) => {
    setProcessingInvitation(token);
    try {
      const response = await api.post(`/api/v1/projects/invitations/${token}/accept`);
      if (response.data.success) {
        toast.success(`You've joined ${projectName}!`);
        fetchInvitations(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to accept invitation");
      }
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to accept invitation";
      toast.error(errorMessage);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleReject = async (token: string, projectName: string) => {
    setProcessingInvitation(token);
    try {
      const response = await api.post(`/api/v1/projects/invitations/${token}/reject`);
      if (response.data.success) {
        toast.success(`Invitation to ${projectName} declined`);
        fetchInvitations(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to reject invitation");
      }
    } catch (error: any) {
      console.error("Error rejecting invitation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reject invitation";
      toast.error(errorMessage);
    } finally {
      setProcessingInvitation(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Project Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Project Invitations
          </CardTitle>
          <CardDescription>You have no pending project invitations</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Project Invitations
        </CardTitle>
        <CardDescription>
          You have {invitations.length} pending invitation{invitations.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.uuid}
              className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">{invitation.project.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {invitation.project.description}
                  </p>
                </div>
                <Badge variant="secondary">{invitation.role}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>From: {invitation.invited_by}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expires: {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.token, invitation.project.name)}
                  disabled={processingInvitation === invitation.token}
                >
                  {processingInvitation === invitation.token ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(invitation.token, invitation.project.name)}
                  disabled={processingInvitation === invitation.token}
                >
                  {processingInvitation === invitation.token ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
