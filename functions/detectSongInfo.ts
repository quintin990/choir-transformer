import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { input_file_url, clip_start_sec, clip_end_sec } = await req.json();

    // Stub: return mock detection values
    // Replace this block with real audio analysis when backend is available
    const result = {
      bpm_detected: 120,
      bpm_confidence: 0.4,
      key_detected: 'C',
      key_confidence: 0.3,
      time_signature_detected: '4/4',
      time_signature_confidence: 0.2,
      downbeat_offset_ms: null,
      mock: true,
    };

    console.log('detectSongInfo stub called for:', input_file_url, clip_start_sec, clip_end_sec);
    return Response.json(result);
  } catch (error) {
    console.error('detectSongInfo error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});