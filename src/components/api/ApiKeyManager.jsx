import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const SCOPES = [
  { id: 'jobs:read', label: 'Read Jobs', desc: 'View job status and results' },
  { id: 'jobs:write', label: 'Create Jobs', desc: 'Submit separation jobs' },
  { id: 'enhance:write', label: 'Enhancement', desc: 'Submit enhancement jobs' },
  { id: 'analyze:read', label: 'Analysis', desc: 'Access audio analysis' },
  { id: 'upload:write', label: 'Upload Files', desc: 'Upload audio files' },
];

export default function ApiKeyManager({ user }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['jobs:read', 'jobs:write']);
  const [showCreate, setShowCreate] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null); // {id, key}
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    const all = await base44.entities.ApiKey.filter({ user_id: user.id });
    setKeys(all);
    setLoading(false);
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'sf_';
    for (let i = 0; i < 40; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const rawKey = generateKey();
    const prefix = rawKey.substring(0, 10);
    const created = await base44.entities.ApiKey.create({
      name: newKeyName.trim(),
      key_hash: btoa(rawKey), // In production, use proper hashing
      key_prefix: prefix,
      user_id: user.id,
      scopes: selectedScopes,
      is_active: true,
      requests_count: 0,
    });
    setKeys(prev => [created, ...prev]);
    setRevealedKey({ id: created.id, key: rawKey });
    setNewKeyName('');
    setSelectedScopes(['jobs:read', 'jobs:write']);
    setShowCreate(false);
    setCreating(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.ApiKey.delete(id);
    setKeys(prev => prev.filter(k => k.id !== id));
    if (revealedKey?.id === id) setRevealedKey(null);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScope = (scope) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage API keys to authenticate your applications.</p>
        <Button onClick={() => setShowCreate(true)} className="gap-2" size="sm">
          <Plus className="w-4 h-4" /> Create API Key
        </Button>
      </div>

      {/* Revealed Key Banner */}
      {revealedKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">Save this key now — it won't be shown again.</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <code className="bg-black/40 px-3 py-2 rounded font-mono text-xs text-green-300 flex-1 break-all">
              {revealedKey.key}
            </code>
            <Button size="sm" variant="outline" onClick={() => handleCopy(revealedKey.key, 'reveal')}>
              {copiedId === 'reveal' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4" /> New API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">Key Name</Label>
              <Input
                placeholder="e.g. My App, Zapier Integration"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm">Scopes</Label>
              <div className="grid grid-cols-2 gap-2">
                {SCOPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleScope(s.id)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedScopes.includes(s.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={!newKeyName.trim() || creating || selectedScopes.length === 0}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Key'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Key className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No API keys yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map(key => (
            <Card key={key.id}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{key.name}</span>
                      {!key.is_active && <Badge variant="outline" className="text-xs text-muted-foreground">Revoked</Badge>}
                    </div>
                    <code className="text-xs text-muted-foreground font-mono">{key.key_prefix}••••••••••••••••••••</code>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(key.scopes || []).map(s => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {format(new Date(key.created_date), 'MMM d, yyyy')}
                      {key.last_used_at && ` · Last used ${format(new Date(key.last_used_at), 'MMM d')}`}
                      {key.requests_count > 0 && ` · ${key.requests_count} requests`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}