import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scissors, CheckCircle, Clock, XCircle, Loader2, Plus, ArrowRight, Zap, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/utils';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import DashboardTour from '@/components/onboarding/DashboardTour';

const STATUS_ICON = {
  done: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  running: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
  queued: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  failed: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  cancelled: <XCircle className="w-3.5 h-3.5 text-white/30" />,
};

const STATUS_COLOR = {
  done: 'text-emerald-400 bg-emerald-400/10',
  running: 'text-blue-400 bg-blue-400/10',
  queued: 'text-amber-400 bg-amber-400/10',
  failed: 'text-red-400 bg-red-400/10',
  cancelled: 'text-white/30 bg-white/5',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (!me.onboarding_completed) setShowOnboarding(true);
        const recentJobs = await base44.entities.Job.list('-created_date', 8);
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
    setShowTour(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const plan = user?.plan || 'free';
  const credits = user?.credits ?? 0;
  const planLimit = { free: 10, starter: 100, pro: 500, enterprise: Infinity }[plan] || 10;
  const creditPct = planLimit === Infinity ? 100 : Math.min(100, (credits / planLimit) * 100);

  const counts = {
    total: jobs.length,
    done: jobs.filter(j => j.status === 'done').length,
    running: jobs.filter(j => ['running', 'queued'].includes(j.status)).length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  return (
    <>
      {showOnboarding && <OnboardingWizard user={user} onComplete={onOnboardingComplete} />}
      {showTour && <DashboardTour onClose={() => setShowTour(false)} />}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {user?.full_name ? `Hey, ${user.full_name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Your recent activity</p>
          </div>
          <Link to={createPageUrl('NewJob')}>
            <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white border-0">
              <Plus className="w-3.5 h-3.5" />
              New job
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total jobs', value: counts.total },
            { label: 'Completed', value: counts.done },
            { label: 'Processing', value: counts.running },
            { label: 'Failed', value: counts.failed },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Credits */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white/60">Credits remaining</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {credits}
                <span className="text-white/30 text-base font-normal ml-1">/ {planLimit === Infinity ? '∞' : planLimit}</span>
              </p>
            </div>
            <Badge className="text-xs capitalize bg-violet-600/20 text-violet-300 border-violet-500/20">
              {plan} plan
            </Badge>
          </div>
          {planLimit !== Infinity && (
            <Progress value={creditPct} className="h-1.5 mb-4 bg-white/5" />
          )}
          <div className="flex gap-2">
            <Link to={createPageUrl('Pricing')}>
              <Button size="sm" variant="outline" className="gap-1.5 border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs">
                <CreditCard className="w-3 h-3" />
                Buy credits
              </Button>
            </Link>
            {plan === 'free' && (
              <Link to={createPageUrl('Pricing')}>
                <Button size="sm" className="gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border-violet-500/20 text-xs">
                  <Zap className="w-3 h-3" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/60">Recent jobs</h2>
            <Link to={createPageUrl('Jobs')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-10 text-center">
              <Scissors className="w-8 h-8 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm mb-4">No jobs yet</p>
              <Link to={createPageUrl('NewJob')}>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Create first job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {jobs.map((job) => (
                <Link key={job.id} to={`/JobDetail?id=${job.id}`}>
                  <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-4 py-3 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      {STATUS_ICON[job.status] || STATUS_ICON.queued}
                      <span className="text-sm text-white truncate">{job.title || 'Untitled'}</span>
                      <span className="text-xs text-white/30 hidden sm:block shrink-0">
                        {job.separation_mode === 'two_stems' ? '2-stem' : '4-stem'} · {job.output_format?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {(job.status === 'running' || job.status === 'queued') && (
                        <div className="w-20 hidden sm:block">
                          <Progress value={job.progress || 0} className="h-1 bg-white/5" />
                        </div>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[job.status] || STATUS_COLOR.queued}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}