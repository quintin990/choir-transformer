import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Plus, Trash2, Key, Code2, Loader2, Check, Eye, EyeOff, Zap } from 'lucide-react';
import ApiKeyManager from '@/components/api/ApiKeyManager';

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/jobs/separation', tag: 'Separation', credits: 2,
    desc: 'Submit an audio file for stem separation.',
    body: `{
  "file_url": "https://...",      // Required: uploaded audio URL
  "separation_mode": "four_stems", // "two_stems" | "four_stems"
  "model": "balanced",             // "fast" | "balanced" | "high_quality"
  "output_format": "wav",          // "wav" | "mp3" | "flac"
  "title": "My Track"             // Optional
}`,
    response: `{
  "job_id": "abc123",
  "status": "queued",
  "estimated_seconds": 60
}`
  },
  {
    method: 'GET', path: '/api/jobs/{job_id}', tag: 'Separation', credits: 0,
    desc: 'Get the status and results of a separation job.',
    body: null,
    response: `{
  "job_id": "abc123",
  "status": "done",  // queued | running | done | failed
  "progress": 100,
  "stems": {
    "vocals": "https://...",
    "drums": "https://...",
    "bass": "https://...",
    "other": "https://..."
  }
}`
  },
  {
    method: 'POST', path: '/api/enhance', tag: 'Enhancement', credits: '2–5',
    desc: 'Apply AI audio enhancement: noise reduction, mastering, restoration or general enhancement.',
    body: `{
  "file_url": "https://...",        // Required
  "task": "noise_reduction",        // "noise_reduction" | "mastering" | "enhancement" | "restoration"
  "model": "pro",                   // "standard" | "pro" | "ultra"
  "settings": {
    "strength": 70                  // Task-specific settings
  }
}`,
    response: `{
  "job_id": "xyz789",
  "status": "queued",
  "task": "noise_reduction"
}`
  },
  {
    method: 'POST', path: '/api/analyze', tag: 'Analysis', credits: 1,
    desc: 'Analyze an audio file and get EQ, loudness, dynamic range, and mix guidance.',
    body: `{
  "file_url": "https://...",
  "title": "My Reference"
}`,
    response: `{
  "analysis_id": "ref456",
  "lufs": -14.2,
  "peak_db": -0.8,
  "dynamic_range": { "rms": -18.5, "crest_factor": 9.2 },
  "eq_curve": { "frequencies": [...], "magnitudes": [...] },
  "guidance": ["Boost highs around 8kHz", "Reduce low-mid mud at 250Hz"]
}`
  },
  {
    method: 'POST', path: '/api/upload', tag: 'Files', credits: 0,
    desc: 'Upload an audio file to get a file_url for use in other endpoints.',
    body: 'Multipart form-data with field "file"',
    response: `{
  "file_url": "https://cdn.soundforge.app/uploads/...",
  "filename": "track.wav",
  "size_bytes": 45678900
}`
  },
  {
    method: 'GET', path: '/api/jobs', tag: 'Jobs', credits: 0,
    desc: 'List all your jobs (separation + enhancement).',
    body: null,
    response: `{
  "jobs": [
    { "job_id": "abc123", "type": "separation", "status": "done", "created_at": "..." },
    { "job_id": "xyz789", "type": "enhancement", "status": "running", "created_at": "..." }
  ],
  "total": 2
}`
  },
];

const METHOD_COLORS = {
  GET: 'bg-green-500/20 text-green-400',
  POST: 'bg-blue-500/20 text-blue-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

const TAGS = ['All', 'Separation', 'Enhancement', 'Analysis', 'Files', 'Jobs'];

function CodeBlock({ code, lang = 'json' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-black/40 rounded-lg p-4 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary rounded p-1"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function ApiDocs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        base44.auth.redirectToLogin('/ApiDocs');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const filteredEndpoints = activeTag === 'All'
    ? ENDPOINTS
    : ENDPOINTS.filter(e => e.tag === activeTag);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Code2 className="w-8 h-8 text-primary" />
            Developer API
          </h1>
          <p className="text-muted-foreground mt-1">
            Integrate SoundForge's audio processing into your own apps and workflows.
          </p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 text-sm px-3 py-1">v1.0</Badge>
      </div>

      <Tabs defaultValue="reference">
        <TabsList>
          <TabsTrigger value="reference">API Reference</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="quickstart">Quickstart</TabsTrigger>
        </TabsList>

        {/* API Reference */}
        <TabsContent value="reference" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Endpoint List */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 mb-3">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      activeTag === tag ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {filteredEndpoints.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedEndpoint === ep ? 'border-primary/60 bg-primary/5' : 'border-border hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${METHOD_COLORS[ep.method]}`}>{ep.method}</Badge>
                    <span className="text-xs font-mono text-muted-foreground truncate">{ep.path}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{ep.desc}</div>
                  {ep.credits > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-amber-400">{ep.credits} credit{ep.credits !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Endpoint Detail */}
            {selectedEndpoint && (
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-sm ${METHOD_COLORS[selectedEndpoint.method]}`}>
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="font-mono text-sm text-foreground">{selectedEndpoint.path}</code>
                      <Badge variant="outline" className="ml-auto text-xs">{selectedEndpoint.tag}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{selectedEndpoint.desc}</p>
                    {selectedEndpoint.credits > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm text-amber-400">Costs {selectedEndpoint.credits} credit{selectedEndpoint.credits !== 1 ? 's' : ''} per call</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Authentication</div>
                      <CodeBlock code={`Authorization: Bearer sf_your_api_key`} />
                    </div>
                    {selectedEndpoint.body && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Request Body</div>
                        <CodeBlock code={selectedEndpoint.body} />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Response</div>
                      <CodeBlock code={selectedEndpoint.response} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="keys" className="mt-4">
          <ApiKeyManager user={user} />
        </TabsContent>

        {/* Quickstart */}
        <TabsContent value="quickstart" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Get your API Key</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Go to the <strong>API Keys</strong> tab above and create a key with the scopes you need.</p>
                <p>Your key will be shown once — save it securely.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Upload your audio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CodeBlock code={`curl -X POST https://api.soundforge.app/upload \\
  -H "Authorization: Bearer sf_your_key" \\
  -F "file=@track.wav"`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">3. Submit a job</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`curl -X POST https://api.soundforge.app/jobs/separation \\
  -H "Authorization: Bearer sf_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_url": "https://cdn.soundforge.app/...",
    "separation_mode": "four_stems",
    "model": "balanced",
    "output_format": "wav"
  }'`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">4. Poll for results</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`curl https://api.soundforge.app/jobs/{job_id} \\
  -H "Authorization: Bearer sf_your_key"

# When status === "done":
# stems.vocals, stems.drums, stems.bass, stems.other
# are available as download URLs`} />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Python SDK Example</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`import soundforge

client = soundforge.Client(api_key="sf_your_key")

# Upload
upload = client.upload("track.wav")

# Separate stems
job = client.jobs.separation.create(
    file_url=upload.file_url,
    separation_mode="four_stems",
    model="high_quality",
    output_format="wav"
)

# Wait for completion
result = job.wait()  # polls automatically
print(result.stems)  # {"vocals": "...", "drums": "...", ...}

# Enhance audio
enhance_job = client.enhance(
    file_url=upload.file_url,
    task="noise_reduction",
    model="pro",
    settings={"strength": 80}
)
enhanced = enhance_job.wait()
`} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}