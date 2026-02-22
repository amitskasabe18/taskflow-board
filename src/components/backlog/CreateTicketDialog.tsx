import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bug, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ticketService, CreateTicketRequest } from "@/services/ticketService";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onTicketCreated?: (ticket: any) => void;
}

export function CreateTicketDialog({ open, onOpenChange, projectId, onTicketCreated }: CreateTicketDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const ticketTypes = [
    { value: "task", label: "Task", icon: CheckCircle },
    { value: "bug", label: "Bug", icon: Bug },
    { value: "story", label: "Story", icon: Plus },
    { value: "epic", label: "Epic", icon: AlertCircle },
  ];

  const priorities = [
    { value: "lowest", label: "Lowest" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "highest", label: "Highest" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!title.trim()) {
      setError("Ticket title is required");
      return;
    }

    setIsLoading(true);

    try {
      const ticketData: CreateTicketRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: type as any,
        priority: priority as any,
        project_id: projectId,
      };

      const response = await ticketService.createTicket(ticketData);
      
      // Reset form
      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
      
      // Close dialog
      onOpenChange(false);
      
      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated(response.data.ticket);
      }
      
      // Show success message
      console.log('Ticket created successfully:', response.data.ticket);
      // You could show a success toast here
      
    } catch (err: any) {
      setError(err.message || "Failed to create ticket. Please try again.");
      console.error('Ticket creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new ticket to add to your backlog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter ticket title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
                className="border-2 focus:border-primary/50"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter ticket description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="border-2 focus:border-primary/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType} disabled={isLoading}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypes.map((ticketType) => (
                      <SelectItem key={ticketType.value} value={ticketType.value}>
                        <div className="flex items-center gap-2">
                          <ticketType.icon className="h-4 w-4" />
                          {ticketType.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
