import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = [
  {
    title: 'Credits & Plan',
    desc: 'Here you can see how many credits you have remaining. Each job costs 2–3 credits. Buy more or upgrade your plan anytime.',
    target: 'credits-card',
    position: 'bottom',
  },
  {
    title: 'Quick Actions',
    desc: 'Jump straight into stem separation, vocal isolation, mix analysis, or batch processing from here.',
    target: 'quick-actions',
    position: 'top',
  },
  {
    title: 'Recent Jobs',
    desc: 'Your latest processing jobs appear here. Click any job to see its status, download stems, or save to Google Drive.',
    target: 'recent-jobs',
    position: 'top',
  },
  {
    title: 'Navigation',
    desc: 'Use the sidebar to navigate between your jobs, batch processing, the Mix Assistant, pricing, and settings.',
    target: null,
    position: 'center',
  },
];

export default function DashboardTour({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/60 pointer-events-none" />

      {/* Tooltip */}
      <div className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <div className="bg-card border border-primary/40 rounded-xl shadow-2xl shadow-primary/10 p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-primary font-medium mb-0.5">
                Step {step + 1} of {STEPS.length}
              </div>
              <h3 className="font-semibold text-base">{current.title}</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{current.desc}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            >
              {isLast ? 'Finish Tour' : 'Next'}
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}