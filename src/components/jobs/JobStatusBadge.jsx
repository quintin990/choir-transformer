import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Ban } from 'lucide-react';

const CONFIGS = {
  queued:    { icon: Clock,      color: 'text-amber-400 bg-amber-400/10',   label: 'Queued' },
  uploading: { icon: Loader2,    color: 'text-blue-400 bg-blue-400/10',     label: 'Uploading', spin: true },
  running:   { icon: Loader2,    color: 'text-blue-400 bg-blue-400/10',     label: 'Processing', spin: true },
  done:      { icon: CheckCircle,color: 'text-emerald-400 bg-emerald-400/10',label: 'Done' },
  failed:    { icon: XCircle,    color: 'text-red-400 bg-red-400/10',       label: 'Failed' },
  cancelled: { icon: Ban,        color: 'text-white/30 bg-white/5',         label: 'Cancelled' },
};

export default function JobStatusBadge({ status, size = 'sm' }) {
  const cfg = CONFIGS[status] || CONFIGS.queued;
  const Icon = cfg.icon;

  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${cfg.color}`}>
      <Icon className={`w-3 h-3 ${cfg.spin ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}