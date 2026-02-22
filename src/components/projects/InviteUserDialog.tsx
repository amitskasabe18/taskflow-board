import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Search, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface InviteUserDialogProps {
  projectUuid: string;
  projectName: string;
  onInviteSent?: () => void;
}

interface SearchedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  in_organization?: boolean;
}

export const InviteUserDialog = ({ projectUuid, projectName, onInviteSent }: InviteUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "lead" | "viewer">("member");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);

  // Search for user when email changes
  useEffect(() => {
    const searchUser = async () => {
      if (!email.trim() || !email.includes("@")) {
        setSearchedUser(null);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setSearchedUser(null);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/api/v1/projects/users/search?email=${encodeURIComponent(email)}`);
        if (response.data.success && response.data.data.users.length > 0) {
          setSearchedUser(response.data.data.users[0]);
        } else {
          setSearchedUser(null);
        }
      } catch (error: any) {
        console.error("Search error:", error);
        setSearchedUser(null);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUser, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!searchedUser) {
      toast.error("User not found. Please verify the email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`/api/v1/projects/${projectUuid}/invitations`, {
        email: email.trim(),
        role: role,
      });

      if (response.data.success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
        setRole("member");
        setSearchedUser(null);
        setOpen(false);
        onInviteSent?.();
      } else {
        toast.error(response.data.message || "Failed to send invitation");
      }
    } catch (error: any) {
      console.error("Invite error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send invitation. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmail("");
      setRole("member");
      setSearchedUser(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
          <DialogDescription>
            Send an invitation to join "{projectName}". The invitation will expire in 7 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isSearching && email && !searchedUser && <Search className="h-4 w-4 text-muted-foreground" />}
                  {!isSearching && searchedUser && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              {searchedUser && (
                <div className="mt-2 p-3 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {searchedUser.first_name[0]}{searchedUser.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {searchedUser.first_name} {searchedUser.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{searchedUser.email}</p>
                    </div>
                    {!searchedUser.in_organization && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <Users className="h-3 w-3" />
                        <span>Will join org</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!isSearching && email && !searchedUser && email.includes("@") && (
                <p className="text-xs text-destructive">
                  User not found. Please verify the email address.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: "member" | "lead" | "viewer") => setRole(value)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Members can contribute, leads can manage, viewers can only view
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !searchedUser}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
