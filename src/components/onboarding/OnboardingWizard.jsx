import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Music2, Mic, Radio, Film, GraduationCap, CheckCircle2, Zap, Scissors } from 'lucide-react';

const USE_CASES = [
  { id: 'music_production', label: 'Music Production', icon: Music2 },
  { id: 'podcast', label: 'Podcast / Voiceover', icon: Mic },
  { id: 'film_tv', label: 'Film & TV', icon: Film },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'other', label: 'Something else', icon: Radio },
];

const STEPS = ['Welcome', 'Use Case', 'Profile', 'Ready'];

export default function OnboardingWizard({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [useCase, setUseCase] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleFinish = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      onboarding_completed: true,
      use_case: useCase || 'other',
      company: company || undefined,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-muted-foreground">{STEPS[step]}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </CardHeader>

        <CardContent className="pt-4 pb-6">
          {step === 0 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Scissors className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Welcome to SoundForge!</CardTitle>
                <CardDescription className="text-base">
                  AI-powered audio processing for creators, producers, and studios.
                  Let's set up your workspace in 1 minute.
                </CardDescription>
              </div>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" />Stem separation</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" />Vocal isolation</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" />Mix analysis</span>
              </div>
              <Button className="w-full mt-4 gap-2" onClick={() => setStep(1)}>
                <Zap className="w-4 h-4" /> Get Started
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <CardTitle className="text-xl mb-1">What do you mainly work on?</CardTitle>
                <CardDescription>We'll tailor your experience to your workflow.</CardDescription>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {USE_CASES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setUseCase(id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      useCase === id
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border hover:border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)} disabled={!useCase}>Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <CardTitle className="text-xl mb-1">Tell us a bit about yourself</CardTitle>
                <CardDescription>Optional — helps us improve your experience.</CardDescription>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Company / Project / Studio name</Label>
                  <Input
                    placeholder="e.g. Acme Records"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">You're all set!</CardTitle>
                <CardDescription className="text-base">
                  Your account is ready. You have <strong className="text-foreground">10 free credits</strong> to start with.
                </CardDescription>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium">Quick tip:</p>
                <p className="text-sm text-muted-foreground">
                  Start with a <strong className="text-foreground">stem separation</strong> job — upload any song and we'll split it into vocals, drums, bass, and more in minutes.
                </p>
              </div>
              <Button
                className="w-full gap-2"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? 'Setting up...' : 'Go to Dashboard'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}