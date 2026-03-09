import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Music, Upload } from 'lucide-react';
import MatchGuide from '../components/reference/MatchGuide';
import FileDropZone from '../components/auralyn/FileDropZone';

export default function Match() {
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('id');
  const [job, setJob] = useState(null);
  const [reference, setReference] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [userFileError, setUserFileError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      const init = async () => {
        try {
          const jobs = await base44.entities.Job.filter({ id: jobId });
          if (jobs.length > 0) {
            setJob(jobs[0]);
            // In production, fetch the corresponding reference analysis
          }
        } catch (err) {
          console.error('Error loading job:', err);
        } finally {
          setLoading(false);
        }
      };
      init();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const handleUserFile = (file, err) => {
    setUserFile(file);
    setUserFileError(err || '');
  };

  const handleAnalyzeMatch = async () => {
    if (!userFile || !job) {
      alert('Please upload your mix file');
      return;
    }

    setAnalyzing(true);
    try {
      // Upload user file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: userFile });

      // Call match analysis (placeholder for now)
      const mockReference = {
        title: job.title,
        lufs: -14.5,
        peak_db: -3.2,
        eq_curve: {
          low_end: 1,
          mids: -2,
          high_end: 3,
        },
        dynamic_range: {
          range_db: 12,
          crest_factor: 11,
        },
        stereo_width: {
          width_percent: 85,
          correlation: 0.65,
        },
      };

      setReference(mockReference);
    } catch (err) {
      console.error('Error analyzing:', err);
      alert('Analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading...</div>;
  }

  if (!jobId) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Music className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--color-muted))' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>Reference Match</h2>
        <p style={{ color: 'hsl(var(--color-muted))' }}>Select a reference job to compare against</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>Match Your Mix</h1>
        <p style={{ color: 'hsl(var(--color-muted))' }}>
          Upload your mix to match against <strong>{job.title}</strong>
        </p>
      </div>

      {!reference ? (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
              <Upload className="w-5 h-5" /> Upload Your Mix
            </h3>
            <FileDropZone file={userFile} onFile={handleUserFile} error={userFileError} />
            <button
              onClick={handleAnalyzeMatch}
              disabled={analyzing || !userFile || !!userFileError}
              className="w-full mt-6 h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </div>

          {/* Reference Info */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Reference Track</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Title</p>
                <p style={{ color: 'hsl(var(--color-text))' }}>{job.title}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Mode</p>
                <p style={{ color: 'hsl(var(--color-text))' }}>{job.mode}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MatchGuide referenceAnalysis={reference} userJob={job} />
      )}
    </div>
  );
}