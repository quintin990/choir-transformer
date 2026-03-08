import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Trash2, Star, StarOff, Check } from 'lucide-react';

const TEMPLATE_VARS = ['{title}', '{date}', '{format}'];

const EXAMPLES = [
  { label: '16-bit WAV', folder: 'StemForge - {title} (WAV)', zip: true, stems: true },
  { label: '320kbps MP3', folder: 'StemForge/{date}/{title}', zip: false, stems: true },
  { label: 'Archive', folder: 'StemForge Archive/{date}', zip: true, stems: false },
];

const DEFAULT_FORM = { name: '', folder_template: 'StemForge - {title}', include_zip: true, include_individual_stems: true, is_default: false };

export default function ExportPresetModal({ onClose, onApply }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'create'

  useEffect(() => { loadPresets(); }, []);

  const loadPresets = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const data = await base44.entities.ExportPreset.filter({ user_id: user.id });
    setPresets(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const user = await base44.auth.me();
    // If marking as default, clear others
    if (form.is_default) {
      await Promise.all(presets.filter(p => p.is_default).map(p => base44.entities.ExportPreset.update(p.id, { is_default: false })));
    }
    await base44.entities.ExportPreset.create({ ...form, user_id: user.id });
    setSaving(false);
    setForm(DEFAULT_FORM);
    setView('list');
    loadPresets();
  };

  const handleDelete = async (id) => {
    await base44.entities.ExportPreset.delete(id);
    loadPresets();
  };

  const handleSetDefault = async (preset) => {
    await Promise.all(presets.map(p => base44.entities.ExportPreset.update(p.id, { is_default: p.id === preset.id })));
    loadPresets();
  };

  const resolveFolder = (template, ctx) =>
    template.replace('{title}', ctx.title || 'Stems').replace('{date}', new Date().toISOString().slice(0, 10)).replace('{format}', ctx.format || 'wav');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f17] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {view === 'create' && (
              <button onClick={() => { setView('list'); setForm(DEFAULT_FORM); }} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-sm font-semibold text-white">
              {view === 'list' ? 'Export Presets' : 'New Preset'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <Button size="sm" onClick={() => setView('create')} className="bg-violet-600 hover:bg-violet-500 text-white border-0 h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> New
              </Button>
            )}
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {view === 'list' ? (
            <>
              {loading ? (
                <p className="text-white/30 text-sm text-center py-6">Loading…</p>
              ) : presets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm mb-4">No presets yet. Create one or start from an example.</p>
                  <div className="space-y-2">
                    {EXAMPLES.map(ex => (
                      <button key={ex.label} onClick={() => { setForm({ ...DEFAULT_FORM, name: ex.label, folder_template: ex.folder, include_zip: ex.zip, include_individual_stems: ex.stems }); setView('create'); }}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                        <p className="text-white text-sm font-medium">{ex.label}</p>
                        <p className="text-white/30 text-xs mt-0.5 font-mono">{ex.folder}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map(preset => (
                    <div key={preset.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white text-sm font-medium truncate">{preset.name}</p>
                          {preset.is_default && <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-medium">Default</span>}
                        </div>
                        <p className="text-white/30 text-xs mt-0.5 font-mono truncate">{preset.folder_template}</p>
                        <p className="text-white/20 text-xs mt-0.5">
                          {[preset.include_zip && 'ZIP', preset.include_individual_stems && 'Stems'].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {onApply && (
                          <button onClick={() => onApply(preset)} title="Apply"
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 transition-all">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleSetDefault(preset)} title={preset.is_default ? 'Remove default' : 'Set as default'}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                          {preset.is_default ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDelete(preset.id)} title="Delete"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Preset name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 16-bit WAV Masters"
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Drive folder template</Label>
                <Input value={form.folder_template} onChange={e => setForm(f => ({ ...f, folder_template: e.target.value }))} placeholder="StemForge - {title}"
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 font-mono text-sm" />
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_VARS.map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, folder_template: f.folder_template + v }))}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:text-violet-300 hover:bg-violet-500/15 transition-all">
                      {v}
                    </button>
                  ))}
                </div>
                {form.folder_template && (
                  <p className="text-xs text-white/25">Preview: <span className="text-white/40 font-mono">{resolveFolder(form.folder_template, { title: 'My Track', format: 'wav' })}</span></p>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-white/50 text-xs">Include individual stems</Label>
                  <Switch checked={form.include_individual_stems} onCheckedChange={v => setForm(f => ({ ...f, include_individual_stems: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white/50 text-xs">Include ZIP archive</Label>
                  <Switch checked={form.include_zip} onCheckedChange={v => setForm(f => ({ ...f, include_zip: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white/50 text-xs">Set as default</Label>
                  <Switch checked={form.is_default} onCheckedChange={v => setForm(f => ({ ...f, is_default: v }))} />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0 mt-2">
                {saving ? 'Saving…' : 'Save preset'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}