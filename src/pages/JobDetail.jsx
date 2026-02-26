import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Music, Download, RefreshCw, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Cloud } from 'lucide-react';
import { format } from 'date-fns';

export default function JobDetail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get('id');

  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSaveStatus, setDriveSaveStatus] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        loadJob();
        loadEvents();
      } catch {
        base44.auth.redirectToLogin('/JobDetail?id=' + jobId);
      }
    };
    loadUser();
  }, [jobId]);

  useEffect(() => {
    if (job && (job.status === 'queued' || job.status === 'running')) {
      setPolling(true);
      const interval = setInterval(() => {
        pollJobStatus();
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setPolling(false);
    }
  }, [job]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const jobs = await base44.entities.Job.filter({ id: jobId });
      if (jobs.length > 0) {
        setJob(jobs[0]);
      }
    } catch (error) {
      console.error('Failed to load job', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const jobEvents = await base44.entities.JobEvent.filter({ job_id: jobId }, '-created_date', 10);
      setEvents(jobEvents);
    } catch (error) {
      console.error('Failed to load events', error);
    }
  };

  const pollJobStatus = async () => {
    try {
      const response = await base44.functions.invoke('providerPollStatus', { job_id: jobId });
      if (response.data.job) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Failed to poll status', error);
    }
  };

  const handleSaveToDrive = async () => {
    setSavingToDrive(true);
    setDriveSaveStatus('');
    try {
      const stems = job.stems || {};
      const folderName = `Choir Transformer - ${job.title || 'Stems'}`;
      const uploads = Object.entries(stems).map(([name, url]) =>
        base44.functions.invoke('googleDriveUpload', {
          file_url: url,
          file_name: `${name}.${job.output_format || 'wav'}`,
          folder_name: folderName
        })
      );
      if (job.output_zip_file) {
        uploads.push(base44.functions.invoke('googleDriveUpload', {
          file_url: job.output_zip_file,
          file_name: `${job.title || 'stems'}_all.zip`,
          folder_name: folderName
        }));
      }
      await Promise.all(uploads);
      setDriveSaveStatus('Saved to Google Drive!');
    } catch (err) {
      setDriveSaveStatus('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingToDrive(false);
    }
  };

  const handleRetry = async () => {
    try {
      const response = await base44.functions.invoke('createJobAndStart', {
        title: job.title,
        input_file_url: job.input_file,
        input_file_meta: {
          filename: job.input_filename,
          mime: job.input_mime,
          size: job.input_size_bytes
        },
        separation_mode: job.separation_mode,
        output_format: job.output_format
      });

      if (response.data.job_id) {
        window.location.href = '/JobDetail?id=' + response.data.job_id;
      }
    } catch (error) {
      console.error('Failed to retry job', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return <Clock className="w-5 h-5" />;
      case 'running': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'done': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
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

  if (loading || !user || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/Jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{job.title || 'Untitled Job'}</h1>
              <p className="text-gray-600">
                Created {format(new Date(job.created_date), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <Badge className={`${getStatusColor(job.status)} text-lg px-4 py-2`}>
              <span className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                {job.status}
              </span>
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Separation Mode</p>
                  <p className="font-medium">
                    {job.separation_mode === 'two_stems' ? 'Two Stems' : 'Four Stems'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Output Format</p>
                  <p className="font-medium">{job.output_format?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-medium">
                    {job.input_size_bytes ? (job.input_size_bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {job.duration_seconds ? job.duration_seconds + 's' : 'N/A'}
                  </p>
                </div>
              </div>

              {(job.status === 'queued' || job.status === 'running') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{job.stage || 'Processing'}</span>
                    <span>{job.progress || 0}%</span>
                  </div>
                  <Progress value={job.progress || 0} className="h-3" />
                </div>
              )}

              {job.status === 'failed' && job.error_message && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{job.error_message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {job.status === 'done' && (
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Download individual stems or save directly to cloud</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleSaveToDrive}
                    disabled={savingToDrive}
                  >
                    {savingToDrive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    Save to Google Drive
                  </Button>
                </div>
                {driveSaveStatus && (
                  <p className={`text-sm ${driveSaveStatus.startsWith('Failed') ? 'text-destructive' : 'text-green-400'}`}>
                    {driveSaveStatus}
                  </p>
                )}
                {job.output_zip_file && (
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">All Stems (ZIP)</p>
                        <p className="text-sm text-muted-foreground">Download all stems in one file</p>
                      </div>
                    </div>
                    <a href={job.output_zip_file} download>
                      <Button>Download</Button>
                    </a>
                  </div>
                )}

                {job.stems && Object.keys(job.stems).length > 0 && (
                  <div className="space-y-3">
                    <p className="font-medium">Individual Stems</p>
                    {Object.entries(job.stems).map(([name, url]) => (
                      <div key={name} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <Music className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium capitalize">{name}</p>
                            <audio controls className="mt-2 w-64 h-8">
                              <source src={url} />
                            </audio>
                          </div>
                        </div>
                        <a href={url} download>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {job.status === 'failed' && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Job
                </Button>
              </CardContent>
            </Card>
          )}

          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                      <div className="flex-1">
                        <p className="text-gray-900">{event.message}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {format(new Date(event.created_date), 'MMM d, h:mm:ss a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}