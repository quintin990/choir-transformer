import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id, file_url } = await req.json();

    // Fetch analysis record
    const analyses = await base44.entities.ReferenceAnalysis.filter({ id: analysis_id });
    if (analyses.length === 0) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const analysis = analyses[0];

    // Verify ownership
    if (analysis.created_by !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      // Use AI to analyze the audio file
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this audio reference track and provide detailed mixing metrics. Return a JSON with:
        - eq_curve: {frequencies: array of 10 freq points from 20Hz-20kHz, magnitudes: array of dB values}
        - dynamic_range: {crest_factor: number, loudness_range: number, rms: number}
        - stereo_width: {overall_width: 0-100, low_freq_width: 0-100, mid_freq_width: 0-100, high_freq_width: 0-100, correlation: 0-1}
        - lufs: integrated LUFS loudness (-23 to 0)
        - peak_db: true peak in dBTP
        - compression_ratio: estimated compression (1-10)
        - guidance: {vocals: {eq, compression, reverb}, drums: {eq, compression, processing}, bass: {eq, compression, processing}, other: {eq, compression, spatial}}
        
        Provide realistic professional mixing analysis with specific frequencies and settings.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            eq_curve: {
              type: "object",
              properties: {
                frequencies: { type: "array", items: { type: "number" } },
                magnitudes: { type: "array", items: { type: "number" } }
              }
            },
            dynamic_range: {
              type: "object",
              properties: {
                crest_factor: { type: "number" },
                loudness_range: { type: "number" },
                rms: { type: "number" }
              }
            },
            stereo_width: {
              type: "object",
              properties: {
                overall_width: { type: "number" },
                low_freq_width: { type: "number" },
                mid_freq_width: { type: "number" },
                high_freq_width: { type: "number" },
                correlation: { type: "number" }
              }
            },
            lufs: { type: "number" },
            peak_db: { type: "number" },
            compression_ratio: { type: "number" },
            guidance: {
              type: "object",
              properties: {
                vocals: { 
                  type: "object",
                  properties: {
                    eq: { type: "string" },
                    compression: { type: "string" },
                    reverb: { type: "string" }
                  }
                },
                drums: {
                  type: "object",
                  properties: {
                    eq: { type: "string" },
                    compression: { type: "string" },
                    processing: { type: "string" }
                  }
                },
                bass: {
                  type: "object",
                  properties: {
                    eq: { type: "string" },
                    compression: { type: "string" },
                    processing: { type: "string" }
                  }
                },
                other: {
                  type: "object",
                  properties: {
                    eq: { type: "string" },
                    compression: { type: "string" },
                    spatial: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      // Update analysis with results
      await base44.entities.ReferenceAnalysis.update(analysis_id, {
        analysis_status: 'completed',
        eq_curve: analysisResult.eq_curve,
        dynamic_range: analysisResult.dynamic_range,
        stereo_width: analysisResult.stereo_width,
        lufs: analysisResult.lufs,
        peak_db: analysisResult.peak_db,
        compression_ratio: analysisResult.compression_ratio,
        guidance: analysisResult.guidance
      });

      return Response.json({ status: 'success', analysis: analysisResult });
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update analysis with error
      await base44.entities.ReferenceAnalysis.update(analysis_id, {
        analysis_status: 'failed',
        error_message: error.message
      });

      return Response.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in reference analysis:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});