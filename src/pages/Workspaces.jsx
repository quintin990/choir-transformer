import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users, Plus, Mail, Crown, Shield, User, Loader2,
  Settings, Trash2, Check, X, Building2, Copy
} from 'lucide-react';
import WorkspaceMembers from '@/components/workspace/WorkspaceMembers';
import CreateWorkspaceDialog from '@/components/workspace/CreateWorkspaceDialog';

export default function Workspaces() {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        await loadWorkspaces(me);
      } catch {
        base44.auth.redirectToLogin('/Workspaces');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadWorkspaces = async (me) => {
    const all = await base44.entities.Workspace.list('-created_date');
    // Filter to workspaces owned by user or user is a member
    const mine = all.filter(w =>
      w.owner_id === me.id ||
      (w.members || []).some(m => m.email === me.email && m.status === 'active')
    );
    setWorkspaces(mine);
    if (mine.length > 0 && !selectedWorkspace) setSelectedWorkspace(mine[0]);
  };

  const handleCreate = async (name, description) => {
    const ws = await base44.entities.Workspace.create({
      name,
      description,
      owner_id: user.id,
      owner_email: user.email,
      members: [],
    });
    setWorkspaces(prev => [ws, ...prev]);
    setSelectedWorkspace(ws);
    setShowCreate(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedWorkspace) return;
    setInviting(true);
    try {
      const newMembers = [
        ...(selectedWorkspace.members || []),
        { email: inviteEmail, role: inviteRole, status: 'pending', invited_at: new Date().toISOString() }
      ];
      const updated = await base44.entities.Workspace.update(selectedWorkspace.id, { members: newMembers });
      setSelectedWorkspace(updated);
      setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
      // Send invite email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `You've been invited to ${selectedWorkspace.name} on SoundForge`,
        body: `${user.full_name || user.email} has invited you to join the workspace "${selectedWorkspace.name}" on SoundForge.\n\nLog in at https://soundforge.app to get started.`,
      });
      setInviteEmail('');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (email) => {
    const newMembers = (selectedWorkspace.members || []).filter(m => m.email !== email);
    const updated = await base44.entities.Workspace.update(selectedWorkspace.id, { members: newMembers });
    setSelectedWorkspace(updated);
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleChangeMemberRole = async (email, newRole) => {
    const newMembers = (selectedWorkspace.members || []).map(m =>
      m.email === email ? { ...m, role: newRole } : m
    );
    const updated = await base44.entities.Workspace.update(selectedWorkspace.id, { members: newMembers });
    setSelectedWorkspace(updated);
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const isOwner = selectedWorkspace?.owner_id === user?.id;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground mt-1">Collaborate with your team on audio projects.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No workspaces yet</h2>
            <p className="text-muted-foreground mb-4">Create a workspace to start collaborating with your team.</p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Workspace List */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Your Workspaces</p>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => setSelectedWorkspace(ws)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selectedWorkspace?.id === ws.id
                    ? 'bg-primary/10 border-primary/40 text-foreground'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <div className="font-medium text-sm truncate">{ws.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(ws.members || []).length + 1} member{(ws.members || []).length !== 0 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>

          {/* Workspace Detail */}
          {selectedWorkspace && (
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {selectedWorkspace.name}
                        {isOwner && <Badge className="bg-amber-500/20 text-amber-400 ml-1">Owner</Badge>}
                      </CardTitle>
                      {selectedWorkspace.description && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedWorkspace.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Invite */}
              {isOwner && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Invite Member
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        type="email"
                        className="flex-1"
                      />
                      <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                        className="bg-background border border-border rounded-md px-3 text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="gap-2">
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Members */}
              <WorkspaceMembers
                workspace={selectedWorkspace}
                currentUser={user}
                isOwner={isOwner}
                onRemove={handleRemoveMember}
                onChangeRole={handleChangeMemberRole}
              />
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateWorkspaceDialog
          onCreate={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}