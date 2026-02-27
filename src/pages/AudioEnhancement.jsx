import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Wand2, Volume2, Zap, Sparkles, Upload, CheckCircle,
  XCircle, Loader2, Play, Download, Music, Clock, ChevronRight
} from 'lucide-react';
import EnhancementUploader from '@/components/enhancement/EnhancementUploader';
import EnhancementJobCard from '@/components/enhancement/EnhancementJobCard';

const TASKS = [
  {
    id: 'noise_reduction',
    label: 'Noise Reduction',
    icon: Volume2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    desc: 'Remove background hiss, hum, and unwanted noise while preserving audio clarity.',
    credits: 2,
    models: [
      { id: 'standard', label: 'Standard', desc: 'Fast, good for voice & podcast' },
      { id: 'pro', label: 'Pro', desc: 'Balanced for music & complex audio' },
      { id: 'ultra', label: 'Ultra', desc: 'Maximum quality, slower processing' },
    ],
    settings: [
      { id: 'strength', label: 'Reduction Strength', min: 0, max: 100, default: 70, unit: '%' },
    ]
  },
  {
    id: 'mastering',
    label: 'AI Mastering',
    icon: Sparkles,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    desc: 'Professional loudness, EQ, and dynamic range optimization to make your track release-ready.',
    credits: 4,
    models: [
      { id: 'standard', label: 'Balanced', desc: 'Neutral mastering for most genres' },
      { id: 'pro', label: 'Loud & Clear', desc: 'Optimized for streaming platforms' },
      { id: 'ultra', label: 'Reference Match', desc: 'Match a reference track\'s profile' },
    ],
    settings: [
      { id: 'target_lufs', label: 'Target Loudness (LUFS)', min: -20, max: -9, default: -14, unit: '' },
      { id: 'limiter_ceiling', label: 'True Peak Ceiling (dB)', min: -3, max: 0, default: -1, unit: 'dB' },
    ]
  },
  {
    id: 'enhancement',
    label: 'Audio Enhancement',
    icon: Wand2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    desc: 'Upscale audio quality, improve clarity, and restore dynamic range with AI.',
    credits: 3,
    models: [
      { id: 'standard', label: 'Clarity Boost', desc: 'Enhance presence and detail' },
      { id: 'pro', label: 'Full Restoration', desc: 'Repair artifacts and improve fidelity' },
      { id: 'ultra', label: 'Studio Grade', desc: 'Near-lossless enhancement pipeline' },
    ],
    settings: [
      { id: 'intensity', label: 'Enhancement Intensity', min: 0, max: 100, default: 60, unit: '%' },
    ]
  },
  {
    id: 'restoration',
    label: 'Audio Restoration',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Repair damaged, clipped, or degraded recordings with AI-powered restoration.',
    credits: 5,
    models: [
      { id: 'standard', label: 'Light Repair', desc: 'Gentle restoration for minor damage' },
      { id: 'pro', label: 'Deep Repair', desc: 'Fix heavy clipping and artifacts' },
      { id: 'ultra', label: 'Archival', desc: 'Maximum effort restoration for historic audio' },
    ],
    settings: [
      { id: 'aggressiveness', label: 'Restoration Aggressiveness', min: 0, max: 100, default: 50, unit: '%' },
    ]
  }
];

export default function AudioEnhancement() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedTask, setSelectedTask] = useState('noise_reduction');
  const [selectedModel, setSelectedModel] = useState('standard');
  const [settings, setSettings] = useState({});
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const recentJobs = await base44.entities.EnhancementJob.list('-created_date', 20);
        setJobs(recentJobs);
      } catch {
        base44.auth.redirectToLogin('/AudioEnhancement');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Init settings when task changes
  useEffect(() => {
    const task = TASKS.find(t => t.id === selectedTask);
    if (!task) return;
    const defaults = {};
    task.settings.forEach(s => { defaults[s.id] = s.default; });
    setSettings(defaults);
    setSelectedModel('standard');
  }, [selectedTask]);

  const currentTask = TASKS.find(t => t.id === selectedTask);

  const handleSubmit = async () => {
    if (!file || !user) return;
    setSubmitting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const job = await base44.entities.EnhancementJob.create({
        title: title || file.name,
        input_file: file_url,
        input_filename: file.name,
        task: selectedTask,
        ai_model: selectedModel,
        settings,
        status: 'queued',
        progress: 0,
      });
      setJobs(prev => [job, ...prev]);
      setFile(null);
      setTitle('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Audio Enhancement</h1>
        <p className="text-muted-foreground mt-1">Noise reduction, mastering, enhancement & restoration powered by AI.</p>
      </div>

      {/* Task Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TASKS.map(task => {
          const Icon = task.icon;
          const isActive = selectedTask === task.id;
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isActive ? `${task.bg} ${task.border}` : 'border-border hover:border-border/80 bg-card'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? task.color : 'text-muted-foreground'}`} />
              <div className="font-semibold text-sm">{task.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{task.credits} credits</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {currentTask && <currentTask.icon className={`w-4 h-4 ${currentTask.color}`} />}
                {currentTask?.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{currentTask?.desc}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* File Upload */}
              <EnhancementUploader file={file} onFileChange={setFile} title={title} onTitleChange={setTitle} />

              {/* Model Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">AI Model</Label>
                <div className="space-y-2">
                  {currentTask?.models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border/60'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.desc}</div>
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Sliders */}
              {currentTask?.settings.map(s => (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">{s.label}</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {settings[s.id] ?? s.default}{s.unit}
                    </span>
                  </div>
                  <Slider
                    min={s.min}
                    max={s.max}
                    step={1}
                    value={[settings[s.id] ?? s.default]}
                    onValueChange={([v]) => setSettings(prev => ({ ...prev, [s.id]: v }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{s.min}{s.unit}</span>
                    <span>{s.max}{s.unit}</span>
                  </div>
                </div>
              ))}

              <Button
                className="w-full gap-2"
                disabled={!file || submitting}
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Submitting...' : `Process with AI · ${currentTask?.credits} credits`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold">Recent Jobs</h2>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Wand2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No enhancement jobs yet</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map(job => <EnhancementJobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}