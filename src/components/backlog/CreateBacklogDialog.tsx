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
import { Target } from "lucide-react";

interface CreateBacklogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBacklog: (backlog: { name: string; description: string }) => void;
}

export function CreateBacklogDialog({ open, onOpenChange, onCreateBacklog }: CreateBacklogDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateBacklog({
        name: name.trim(),
        description: description.trim(),
      });
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create New Backlog
          </DialogTitle>
          <DialogDescription>
            Create a new backlog to organize and prioritize your work items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter backlog name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-2 focus:border-primary/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter backlog description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-2 focus:border-primary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Backlog
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
