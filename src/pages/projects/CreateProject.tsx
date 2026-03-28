import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProject } from '@/context/ProjectContext';
import { userService, Role } from '@/services/userService';
import {
  ArrowLeft, ArrowRight, CalendarIcon, Plus, X,
  Layers, Users, CalendarDays, CheckCircle2, Save, Rocket,
  UserCircle2, Tag,
} from 'lucide-react';
import { CreateProjectData } from '@/types/project';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Layers },
  { id: 2, label: 'Invite Team', icon: Users },
  { id: 3, label: 'Timeline', icon: CalendarDays },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  email: string;
  role: string;
  customRole?: string;
}

interface ExtendedFormData extends CreateProjectData {
  teamMembers: TeamMember[];
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((step, idx) => {
      const Icon = step.icon;
      const isCompleted = currentStep > step.id;
      const isActive = currentStep === step.id;

      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'relative flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300',
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isActive
                    ? 'bg-background border-primary text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                    : 'bg-background border-muted-foreground/25 text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium tracking-wide whitespace-nowrap',
                isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>

          {idx < STEPS.length - 1 && (
            <div className="relative mx-3 mb-6 flex-1 max-w-[80px]">
              <div className="h-[2px] w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full bg-primary transition-all duration-500 ease-out',
                    isCompleted ? 'w-full' : 'w-0'
                  )}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

const StepBasicInfo = ({
  formData,
  setFormData,
  newTag,
  setNewTag,
  addTag,
  removeTag,
}: {
  formData: ExtendedFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExtendedFormData>>;
  newTag: string;
  setNewTag: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">Project basics</h2>
      <p className="text-sm text-muted-foreground">Give your project an identity</p>
    </div>

    {/* Name */}
    <div className="space-y-2">
      <Label htmlFor="name" className="text-sm font-medium">
        Project Name <span className="text-destructive">*</span>
      </Label>
      <Input
        id="name"
        placeholder="e.g. Design System Revamp"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
    </div>

    {/* Shortcode */}
    <div className="space-y-2">
      <Label htmlFor="shortcode" className="text-sm font-medium">Shortcode</Label>
      <div className="relative">
        <Input
          id="shortcode"
          placeholder="Auto-generated"
          value={formData.shortcode}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              shortcode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6),
            }))
          }
          className="font-mono tracking-widest uppercase pr-16"
          maxLength={6}
        />
        {formData.shortcode && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge variant="secondary" className="font-mono text-xs">{formData.shortcode}</Badge>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Used to prefix task IDs like{' '}
        <span className="font-mono text-foreground">{formData.shortcode || 'PRJ'}-42</span>
      </p>
    </div>

    {/* Description */}
    <div className="space-y-2">
      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
      <Textarea
        id="description"
        placeholder="What are the goals and objectives of this project?"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        rows={4}
        className="resize-none"
      />
    </div>

    {/* Priority */}
    <div className="space-y-2">
      <Label className="text-sm font-medium">Priority</Label>
      <div className="grid grid-cols-4 gap-2">
        {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
            className={cn(
              'px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all duration-150',
              formData.priority === p
                ? p === 'critical'
                  ? 'bg-destructive text-destructive-foreground border-destructive'
                  : p === 'high'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : p === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-background border-input text-muted-foreground hover:border-foreground/40'
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>

    {/* Tags */}
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5" /> Tags
      </Label>
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag…"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={addTag}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {formData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-sm hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Step 2: Invite Team ──────────────────────────────────────────────────────

const StepInviteTeam = ({
  teamMembers,
  setFormData,
  availableRoles,
}: {
  teamMembers: TeamMember[];
  setFormData: React.Dispatch<React.SetStateAction<ExtendedFormData>>;
  availableRoles: Role[];
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const addMember = () => {
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!validateEmail(email.trim())) { setEmailError('Enter a valid email address'); return; }
    if (!role) { setEmailError('Please select a role'); return; }
    if (teamMembers.find(m => m.email === email.trim())) {
      setEmailError('This email has already been added');
      return;
    }
    setEmailError('');
    setFormData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { email: email.trim(), role, customRole: role === 'Other' ? customRole : undefined },
      ],
    }));
    setEmail(''); setRole(''); setCustomRole('');
  };

  const removeMember = (em: string) =>
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.email !== em),
    }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Invite your team</h2>
        <p className="text-sm text-muted-foreground">Add collaborators and assign their roles</p>
      </div>

      {/* Add member form */}
      <Card className="border-dashed">
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email address</Label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Role</Label>
            <Select value={role} onValueChange={(v) => { setRole(v); setEmailError(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {availableRoles.length > 0 ? (
                  availableRoles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="member">Member</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {role === 'Other' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label className="text-sm font-medium">Specify role</Label>
              <Input
                placeholder="e.g. Growth Engineer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            </div>
          )}

          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}

          <Button type="button" onClick={addMember} className="w-full gap-2" variant="outline">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </CardContent>
      </Card>

      {/* Member list */}
      {teamMembers.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {teamMembers.length} member{teamMembers.length > 1 ? 's' : ''} added
          </p>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/60 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.role === 'Other' && member.customRole ? member.customRole : member.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(member.email)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2 border border-dashed rounded-lg">
          <Users className="w-8 h-8 opacity-30" />
          <p className="text-sm">No team members added yet</p>
          <p className="text-xs opacity-70">You can always invite more people later</p>
        </div>
      )}
    </div>
  );
};

// ─── Step 3: Timeline ─────────────────────────────────────────────────────────

const StepTimeline = ({
  formData,
  setFormData,
}: {
  formData: ExtendedFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExtendedFormData>>;
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">Set the timeline</h2>
      <p className="text-sm text-muted-foreground">When does your project start and end?</p>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Start Date <span className="text-destructive">*</span>
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !formData.startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a start date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.startDate}
            onSelect={(d) => setFormData(prev => ({ ...prev, startDate: d || new Date() }))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">
        End Date{' '}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !formData.endDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick an end date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.endDate}
            onSelect={(d) => setFormData(prev => ({ ...prev, endDate: d }))}
            disabled={(d) => !!formData.startDate && d < formData.startDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {formData.endDate && formData.startDate && (
        <p className="text-xs text-muted-foreground">
          Duration:{' '}
          <span className="font-medium text-foreground">
            {Math.ceil(
              (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
            )}{' '}
            days
          </span>
        </p>
      )}
    </div>

    {/* Summary card */}
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Summary
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Project</p>
          <p className="font-medium truncate">{formData.name || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Priority</p>
          <p className="font-medium capitalize">{formData.priority}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Team size</p>
          <p className="font-medium">
            {formData.teamMembers.length} member
            {formData.teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Tags</p>
          <p className="font-medium">{formData.tags.length || '—'}</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProject();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'create' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExtendedFormData>({
    name: '',
    description: '',
    priority: 'medium',
    startDate: new Date(),
    team: [],
    tags: [],
    shortcode: '',
    teamMembers: [],
  });

  const [newTag, setNewTag] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableDesignations, setAvailableDesignations] = useState<Designation[]>([]);

  // Fetch roles and designations on component mount
  useEffect(() => {
    const fetchRolesAndDesignations = async () => {
      try {
        const [roles, designations] = await Promise.all([
          userService.getRoles(),
          userService.getDesignations()
        ]);
        setAvailableRoles(roles);
        setAvailableDesignations(designations);
      } catch (error) {
        console.error('Failed to fetch roles/designations:', error);
      }
    };

    fetchRolesAndDesignations();
  }, []);

  // Auto-generate shortcode from project name initials
  useEffect(() => {
    if (formData.name) {
      const generated = formData.name
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, '')[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 4);
      setFormData((prev) => ({ ...prev, shortcode: generated }));
    }
  }, [formData.name]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const canProceed = () => {
    if (currentStep === 1) return formData.name.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ── Send invitations with correct role and designation ───────────────────
  const sendInvitations = async (projectUuid: string, token: string) => {
    const results = { successful: 0, failed: 0, failedEmails: [] as string[] };

    // Send each invitation individually with correct payload
    for (const member of formData.teamMembers) {
      // Find the designation ID for this member
      const designationObj = availableDesignations.find(d => d.name === member.designation);
      const designationId = designationObj?.id;
      
      const payload = { 
        emails: [member.email], 
        role: member.role, // member/lead/viewer (permission)
        designation_id: designationId // Job title ID
      };

      console.log(`→ Sending invitation for ${member.email}`, payload);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/projects/${projectUuid}/invitations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        console.log(`← Response for ${member.email}:`, data);

        if (res.ok && data.success) {
          // Count successful invitations from response
          if (data.data && data.data.results) {
            data.data.results.forEach((result: any) => {
              if (result.success) {
                results.successful++;
              } else {
                results.failed++;
                results.failedEmails.push(result.email);
              }
            });
          } else {
            // Fallback: assume all were successful if no detailed results
            results.successful++;
          }
        } else {
          // All emails in this batch failed
          results.failed++;
          results.failedEmails.push(member.email);
          console.warn(`Invite failed for ${member.email}:`, data?.message);
        }
      } catch (err) {
        console.error(`Exception while inviting ${member.email}:`, err);
        results.failed++;
        results.failedEmails.push(member.email);
      }
    }

    return results;
  };

  const handleSubmit = async (mode: 'draft' | 'create') => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMode(mode);
      setError(null);

      const token =
        localStorage.getItem('auth_token') || localStorage.getItem('token') || '';

      if (!token) throw new Error('No authentication token found. Please log in again.');

      // ── Step 1: Create the project ─────────────────────────────────────────
      const payload: CreateProjectData = {
        ...formData,
        team: [],                                          // invitations handled separately
        status: mode === 'draft' ? 'draft' : 'active',
      };

      const projectResponse = await createProject(payload);

      // createProject returns a Project object directly, not wrapped in response.data
      const projectUuid = projectResponse?.uuid || '';

      console.log('Project created. UUID:', projectUuid);
      console.log('Full project response:', projectResponse);
      console.log('Team members to invite:', formData.teamMembers.length);
      console.log('Team members data:', formData.teamMembers);

      if (!projectUuid) {
        throw new Error(
          'Project was created but no UUID was returned. Cannot send invitations.'
        );
      }

      // ── Step 2: Invite each team member individually ───────────────────────
      if (formData.teamMembers.length > 0) {
        console.log('Starting invitation process for', formData.teamMembers.length, 'members');
        const results = await sendInvitations(projectUuid, token);
        console.log('Invitation results:', results);

        if (results.failed > 0) {
          setError(
            `Project created! However, ${results.failed} invitation(s) failed: ${results.failedEmails.join(', ')}`
          );
          // Navigate after a short delay so the user can read the warning
          setTimeout(() => navigate('/projects'), 3000);
          return;
        }
      } else {
        console.log('No team members to invite');
      }

      navigate('/projects');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(
        err?.response?.data?.message ??
        err?.message ??
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setSubmitMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projects')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={currentStep} />

        {/* Step content */}
        <div key={currentStep}>
          {currentStep === 1 && (
            <StepBasicInfo
              formData={formData}
              setFormData={setFormData}
              newTag={newTag}
              setNewTag={setNewTag}
              addTag={addTag}
              removeTag={removeTag}
            />
          )}
          {currentStep === 2 && (
            <StepInviteTeam
              teamMembers={formData.teamMembers}
              setFormData={setFormData}
              availableRoles={availableRoles}
              availableDesignations={availableDesignations}
            />
          )}
          {currentStep === 3 && (
            <StepTimeline formData={formData} setFormData={setFormData} />
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className={cn('flex gap-3', currentStep === 1 ? 'justify-end' : 'justify-between')}>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2 flex-1 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting && submitMode === 'draft' ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('create')}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Rocket className="w-4 h-4" />
                {isSubmitting && submitMode === 'create' ? 'Creating…' : 'Create Project'}
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};