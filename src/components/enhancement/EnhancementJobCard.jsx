import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Clock, Download, Wand2, Volume2, Sparkles, Zap } from 'lucide-react';

const TASK_META = {
  noise_reduction: { label: 'Noise Reduction', icon: Volume2, color: 'text-blue-400' },
  mastering: { label: 'AI Mastering', icon: Sparkles, color: 'text-purple-400' },
  enhancement: { label: 'Enhancement', icon: Wand2, color: 'text-green-400' },
  restoration: { label: 'Restoration', icon: Zap, color: 'text-amber-400' },
};

const STATUS_COLORS = {
  queued: 'border-secondary text-muted-foreground',
  running: 'border-blue-500/40 text-blue-400',
  done: 'border-green-500/40 text-green-400',
  failed: 'border-red-500/40 text-red-400',
};

export default function EnhancementJobCard({ job }) {
  const meta = TASK_META[job.task] || TASK_META.enhancement;
  const Icon = meta.icon;

  return (
    <Card className={`border ${STATUS_COLORS[job.status] || ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${meta.color}`} />
            <span className="font-medium text-sm truncate max-w-[140px]">{job.title || job.input_filename || 'Untitled'}</span>
          </div>
          <div className="flex items-center gap-1">
            {job.status === 'queued' && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
            {job.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
            {job.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
            {job.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
            <span className="text-xs capitalize text-muted-foreground">{job.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">{meta.label}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{job.ai_model || 'standard'}</Badge>
        </div>
        {job.status === 'running' && (
          <Progress value={job.progress || 0} className="h-1.5" />
        )}
        {job.status === 'done' && job.output_file && (
          <a href={job.output_file} download>
            <Button size="sm" variant="outline" className="w-full gap-2 mt-1">
              <Download className="w-3.5 h-3.5" />
              Download Result
            </Button>
          </a>
        )}
        {job.status === 'failed' && job.error_message && (
          <p className="text-xs text-red-400">{job.error_message}</p>
        )}
      </CardContent>
    </Card>
  );
}