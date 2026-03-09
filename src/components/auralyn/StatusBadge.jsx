import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react';

const CFG = {
  queued:     { label: 'Queued',     color: '#9CB2D6', bg: '#1C2A44',   Icon: Clock,       spin: false },
  uploading:  { label: 'Uploading',  color: '#1EA0FF', bg: '#1EA0FF15', Icon: Loader2,     spin: true  },
  processing: { label: 'Processing', color: '#1EA0FF', bg: '#1EA0FF15', Icon: Loader2,     spin: true  },
  packaging:  { label: 'Packaging',  color: '#FFB020', bg: '#FFB02015', Icon: Loader2,     spin: true  },
  done:       { label: 'Done',       color: '#19D3A2', bg: '#19D3A215', Icon: CheckCircle2,spin: false },
  failed:     { label: 'Failed',     color: '#FF4D6D', bg: '#FF4D6D15', Icon: XCircle,     spin: false },
  cancelled:  { label: 'Cancelled',  color: '#9CB2D6', bg: '#1C2A44',   Icon: Ban,         spin: false },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = CFG[status] || CFG.queued;
  const { label, color, bg, Icon, spin } = cfg;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${pad}`}
      style={{ color, backgroundColor: bg }}>
      <Icon className={`w-3 h-3 ${spin ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}