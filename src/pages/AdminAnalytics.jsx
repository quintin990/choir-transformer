import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Users, Briefcase, CreditCard, TrendingUp, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const PLAN_COLORS = { free: '#6b7280', starter: '#3b82f6', pro: '#8b5cf6', enterprise: '#f59e0b' };
const STATUS_COLORS = { done: '#22c55e', running: '#3b82f6', queued: '#6b7280', failed: '#ef4444', cancelled: '#6b7280' };

function StatCard({ title, value, sub, icon: Icon, trend }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
          {trend !== undefined && (
            <Badge variant="outline" className={trend >= 0 ? 'text-green-400' : 'text-destructive'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold mb-0.5">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (me.role !== 'admin') {
          window.location.href = '/Dashboard';
          return;
        }
        const [allJobs, allUsers] = await Promise.all([
          base44.entities.Job.list('-created_date', 500),
          base44.entities.User.list('-created_date', 200),
        ]);
        setJobs(allJobs);
        setUsers(allUsers);
      } catch {
        base44.auth.redirectToLogin('/AdminAnalytics');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Aggregate stats
  const totalJobs = jobs.length;
  const doneJobs = jobs.filter(j => j.status === 'done').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const totalUsers = users.length;
  const paidUsers = users.filter(u => u.plan && u.plan !== 'free').length;
  const onboardedUsers = users.filter(u => u.onboarding_completed).length;

  // Jobs per day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    const label = format(d, 'MMM d');
    const dayJobs = jobs.filter(j => {
      const jd = startOfDay(new Date(j.created_date));
      return jd.getTime() === d.getTime();
    });
    return { date: label, total: dayJobs.length, done: dayJobs.filter(j => j.status === 'done').length };
  });

  // Jobs by status
  const byStatus = Object.entries(
    jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Users by plan
  const byPlan = Object.entries(
    users.reduce((acc, u) => { const p = u.plan || 'free'; acc[p] = (acc[p] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Jobs by separation mode
  const byMode = [
    { name: '2-Stem', value: jobs.filter(j => j.separation_mode === 'two_stems').length },
    { name: '4-Stem', value: jobs.filter(j => j.separation_mode === 'four_stems').length },
  ];

  // New users per day (last 14 days)
  const usersByDay = Array.from({ length: 14 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    const label = format(d, 'MMM d');
    const count = users.filter(u => startOfDay(new Date(u.created_date)).getTime() === d.getTime()).length;
    return { date: label, users: count };
  });

  // Recent jobs table
  const recentJobs = [...jobs].slice(0, 20);

  const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform-wide metrics and engagement insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} sub={`${onboardedUsers} onboarded`} />
        <StatCard title="Paid Users" value={paidUsers} icon={CreditCard} sub={`${Math.round(paidUsers / Math.max(totalUsers, 1) * 100)}% conversion`} />
        <StatCard title="Total Jobs" value={totalJobs} icon={Briefcase} sub={`${doneJobs} completed`} />
        <StatCard title="Success Rate" value={`${Math.round(doneJobs / Math.max(totalJobs, 1) * 100)}%`} icon={TrendingUp} sub={`${failedJobs} failed`} />
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Job Activity</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdowns</TabsTrigger>
          <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jobs Per Day (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={last14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="total" fill="#4b5563" name="Total" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="done" fill="#8b5cf6" name="Completed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Signups Per Day (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={usersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} dot={false} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Users by plan */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Users by Plan</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byPlan} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                      {byPlan.map((entry, i) => (
                        <Cell key={i} fill={PLAN_COLORS[entry.name] || COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-2">
                {byPlan.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PLAN_COLORS[p.name] || '#6b7280' }} />
                      <span className="capitalize text-sm">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{p.value}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(p.value / Math.max(totalUsers, 1) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Jobs by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                      {byStatus.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {byStatus.map(s => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#6b7280' }} />
                      <span className="capitalize">{s.name}</span>
                      <span className="ml-auto font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Separation Mode Usage</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byMode} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={60} />
                    <Tooltip contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <CardDescription>Latest 20 jobs across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {job.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                      {(job.status === 'running' || job.status === 'queued') && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
                      {job.status === 'failed' && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                      {job.status === 'cancelled' && <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="text-sm font-medium truncate">{job.title || 'Untitled'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 ml-4">
                      <span className="hidden sm:block">{job.separation_mode === 'two_stems' ? '2-Stem' : '4-Stem'}</span>
                      <span className="hidden md:block">{job.output_format?.toUpperCase()}</span>
                      <span>{format(new Date(job.created_date), 'MMM d, HH:mm')}</span>
                      <span className="text-xs">{job.created_by?.split('@')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}