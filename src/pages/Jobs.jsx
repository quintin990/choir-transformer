import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Music, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Jobs() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        loadJobs();
      } catch {
        base44.auth.redirectToLogin(createPageUrl('Jobs'));
      }
    };
    loadUser();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await base44.entities.Job.list('-created_date');
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return 'bg-gray-100 text-gray-700';
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'done': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Jobs</h1>
            <p className="text-gray-600">View and manage your separation jobs</p>
          </div>
          <Link to={createPageUrl('NewJob')}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="queued">Queued</TabsTrigger>
            <TabsTrigger value="running">Running</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-600 animate-spin" />
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No jobs found</p>
              <Link to={createPageUrl('NewJob')}>
                <Button>Create Your First Job</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={createPageUrl('JobDetail') + '?id=' + job.id}>
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Music className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-lg">{job.title || 'Untitled'}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(job.status)}
                              {job.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{job.separation_mode === 'two_stems' ? '2 Stems' : '4 Stems'}</span>
                          <span>•</span>
                          <span>{job.output_format?.toUpperCase()}</span>
                          <span>•</span>
                          <span>{format(new Date(job.created_date), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                      {(job.status === 'queued' || job.status === 'running') && (
                        <div className="w-32">
                          <div className="text-xs text-gray-600 mb-1 text-right">
                            {job.progress || 0}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${job.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}