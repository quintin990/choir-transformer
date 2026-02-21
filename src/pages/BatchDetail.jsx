import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Files, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BatchDetail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const batchId = params.get('id');

  const [user, setUser] = useState(null);
  const [batch, setBatch] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        await loadBatch();
      } catch {
        base44.auth.redirectToLogin('/BatchDetail?id=' + batchId);
      }
    };
    loadData();
  }, [batchId]);

  useEffect(() => {
    if (batch && batch.status === 'processing') {
      const interval = setInterval(() => {
        loadBatch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [batch]);

  const loadBatch = async () => {
    try {
      const batches = await base44.entities.BatchJob.filter({ id: batchId });
      if (batches.length > 0) {
        setBatch(batches[0]);
        const batchJobs = await base44.entities.Job.filter({ batch_job_id: batchId });
        setJobs(batchJobs);
      }
    } catch (error) {
      console.error('Failed to load batch', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const progress = batch.total_files > 0 
    ? ((batch.completed_files + batch.failed_files) / batch.total_files) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/Jobs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Files className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Batch Job</h1>
          </div>
          <p className="text-gray-600">{batch.title || 'Processing multiple files'}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Batch Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{batch.total_files}</p>
                <p className="text-sm text-gray-600">Total Files</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{batch.completed_files}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{batch.failed_files}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Individual Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.id} to={'/JobDetail?id=' + job.id}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1">
                      {job.status === 'done' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : job.status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.stage || job.status}</p>
                      </div>
                    </div>
                    {(job.status === 'queued' || job.status === 'running') && (
                      <div className="w-20 text-right text-sm text-gray-600">
                        {job.progress || 0}%
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}