import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Scissors, Mic, Wand2, Upload, ArrowRight, Zap, CheckCircle,
  Clock, XCircle, Loader2, TrendingUp, CreditCard, Plus
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import DashboardTour from '@/components/onboarding/DashboardTour';

const PLAN_LIMITS = { free: 10, starter: 100, pro: 500, enterprise: Infinity };
const PLAN_COLORS = {
  free: 'bg-secondary text-muted-foreground',
  starter: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-primary/20 text-primary',
  enterprise: 'bg-amber-500/20 text-amber-400',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (!me.onboarding_completed) setShowOnboarding(true);
        const recentJobs = await base44.entities.Job.list('-created_date', 5);
        setJobs(recentJobs);
      } catch {
        base44.auth.redirectToLogin('/Dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const onOnboardingComplete = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const plan = user?.plan || 'free';
  const credits = user?.credits ?? 0;
  const planLimit = PLAN_LIMITS[plan] || 10;
  const creditPct = planLimit === Infinity ? 100 : Math.min(100, (credits / planLimit) * 100);

  const statCounts = {
    total: jobs.length,
    done: jobs.filter(j => j.status === 'done').length,
    running: jobs.filter(j => j.status === 'running' || j.status === 'queued').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const quickActions = [
    { label: 'Stem Separation', desc: 'Split tracks into stems', icon: Scissors, to: '/NewJob', credits: 2 },
    { label: 'Vocal Isolation', desc: 'Extract clean vocals', icon: Mic, to: '/NewJob', credits: 2 },
    { label: 'Mix Assistant', desc: 'AI reference analysis', icon: Wand2, to: '/ReferenceMixAssistant', credits: 1 },
    { label: 'Batch Process', desc: 'Process multiple files', icon: Upload, to: '/BatchUpload', credits: 'varies' },
  ];

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard user={user} onComplete={onOnboardingComplete} />
      )}

      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your audio projects.</p>
          </div>
          <Link to="/NewJob">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Job
            </Button>
          </Link>
        </div>

        {/* Credits + Plan Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-muted-foreground">Credits Remaining</CardTitle>
                <Badge className={PLAN_COLORS[plan]}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold">{credits}</span>
                <span className="text-muted-foreground mb-1">/ {planLimit === Infinity ? '∞' : planLimit} credits</span>
              </div>
              {planLimit !== Infinity && (
                <Progress value={creditPct} className="h-2 mb-3" />
              )}
              <div className="flex gap-2">
                <Link to="/Pricing">
                  <Button size="sm" variant="outline" className="gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Buy Credits
                  </Button>
                </Link>
                {plan === 'free' && (
                  <Link to="/Pricing">
                    <Button size="sm" className="gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Jobs</span>
                <span className="font-semibold">{statCounts.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3.5 h-3.5" />Done</span>
                <span className="font-semibold">{statCounts.done}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-blue-400"><Loader2 className="w-3.5 h-3.5" />In Progress</span>
                <span className="font-semibold">{statCounts.running}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3.5 h-3.5" />Failed</span>
                <span className="font-semibold">{statCounts.failed}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.to}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-5 pb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{action.label}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {typeof action.credits === 'number' ? `${action.credits} credits` : action.credits}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
            <Link to="/Jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Scissors className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">No jobs yet. Start by creating your first one.</p>
                <Link to="/NewJob"><Button>Create First Job</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <Link key={job.id} to={`/JobDetail?id=${job.id}`}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {job.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {(job.status === 'queued' || job.status === 'running') && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                          {job.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                          {job.status === 'cancelled' && <XCircle className="w-4 h-4 text-muted-foreground" />}
                          <span className="font-medium">{job.title || 'Untitled'}</span>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {job.separation_mode === 'two_stems' ? '2-Stem' : '4-Stem'} · {job.output_format?.toUpperCase()}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                      </div>
                      {(job.status === 'running' || job.status === 'queued') && (
                        <div className="mt-2">
                          <Progress value={job.progress || 0} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}