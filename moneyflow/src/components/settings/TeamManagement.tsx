// src/components/settings/TeamManagement.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Mail, Trash2, Loader2, UserCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTeamMembers } from '@/hooks/useOrganization';
import { useUsers } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { teamMemberInvitationSchema } from '@/schemas/organizationSchemas';
import type { TeamMemberInvitationData } from '@/schemas/organizationSchemas';
import { formatDate } from '@/lib/formatters';
import { ROLES } from '@/constants/roles';
import type { UserRole } from '@/types';
import { toast } from 'sonner';

export function TeamManagement() {
  const { teamMembers, isLoading } = useTeamMembers();
  const { organization } = useAuth();
  const { createUser, deleteUser, updateUser, isCreating, isDeleting, isUpdating } = useUsers();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamMemberInvitationData>({
    resolver: zodResolver(teamMemberInvitationSchema),
    defaultValues: {
      send_invitation_email: true,
    },
  });

  const role = watch('role');

  const handleInvite = async (data: TeamMemberInvitationData) => {
    try {
      // Check if user already exists in organization
      const existingMember = teamMembers.find(m => m.email.toLowerCase() === data.email.toLowerCase());
      if (existingMember) {
        toast.error('A team member with this email already exists');
        return;
      }

      // For MVP: Create a pending invitation record
      // The user will need to sign up with this email, and they'll be linked to the org
      // In production, you'd use Supabase Admin API to send an invitation email
      const fullName = data.full_name || data.email.split('@')[0];
      if (!fullName) {
        throw new Error('Full name is required');
      }

      // Create user record with pending status (no auth_user_id yet)
      // This will be linked when the user signs up with the same email
      await createUser({
        email: data.email,
        full_name: fullName,
        role: data.role,
        is_active: false, // Inactive until they sign up
        organization_id: organization?.id ?? '',
        auth_user_id: `pending_${crypto.randomUUID()}`, // Placeholder - will be updated on signup
      } as any);

      toast.success(
        'Invitation created! Ask the team member to sign up with this email address.',
        { duration: 5000 }
      );
      setShowInviteDialog(false);
      reset();
    } catch (error) {
      logger.error('Error inviting team member:', error instanceof Error ? error.message : String(error));
      toast.error(error instanceof Error ? error.message : 'Failed to invite team member');
    }
  };

  const handleRemove = async (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      toast.success('Team member removed successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {

      logger.error('Error removing team member:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to remove team member');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUser({ id: userId, updates: { role: newRole } });
      toast.success('Role updated successfully');
    } catch (error) {

      logger.error('Error updating role:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to update role');
    }
  };

  if (isLoading) {
    return <Loader message="Loading team members..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </div>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members"
              description="Invite someone to get started with your team."
              action={
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLES)
                            .filter(([key]) => key !== 'super_admin' && key !== 'customer')
                            .map(([key, role]) => (
                              <SelectItem key={key} value={key}>
                                {role.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={member.is_active ? 'active' : 'inactive'}
                        type="custom"
                        label={member.is_active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(member.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your organization</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                placeholder="colleague@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name (Optional)</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                error={!!errors.full_name}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role ?? ''} onValueChange={(value) => setValue('role', value as any)}>
                <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES)
                    .filter(([key]) => key !== 'super_admin' && key !== 'customer')
                    .map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmRemove}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        confirmText="Remove"
        confirmVariant={'destructive'}
        loading={isDeleting}
      />
    </div>
  );
}
