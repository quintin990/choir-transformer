import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown, Shield, User, Trash2 } from 'lucide-react';

const ROLE_META = {
  owner: { label: 'Owner', icon: Crown, color: 'bg-amber-500/20 text-amber-400' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-blue-500/20 text-blue-400' },
  member: { label: 'Member', icon: User, color: 'bg-secondary text-muted-foreground' },
  viewer: { label: 'Viewer', icon: User, color: 'bg-secondary text-muted-foreground' },
};

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-amber-500/20 text-amber-400',
};

export default function WorkspaceMembers({ workspace, currentUser, isOwner, onRemove, onChangeRole }) {
  const owner = { email: workspace.owner_email, role: 'owner', status: 'active' };
  const allMembers = [owner, ...(workspace.members || [])];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members ({allMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {allMembers.map((member, i) => {
          const roleMeta = ROLE_META[member.role] || ROLE_META.member;
          const RoleIcon = roleMeta.icon;
          const isCurrentUser = member.email === currentUser?.email;
          const isOwnerRow = member.role === 'owner';

          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <RoleIcon className={`w-4 h-4 ${roleMeta.color.split(' ')[1]}`} />
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {member.email}
                    {isCurrentUser && <span className="text-xs text-muted-foreground">(you)</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`text-xs ${roleMeta.color}`}>{roleMeta.label}</Badge>
                    {member.status && !isOwnerRow && (
                      <Badge className={`text-xs ${STATUS_COLORS[member.status] || ''}`}>
                        {member.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {isOwner && !isOwnerRow && !isCurrentUser && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={e => onChangeRole(member.email, e.target.value)}
                    className="text-xs bg-background border border-border rounded px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(member.email)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}