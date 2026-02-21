import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, reference_file_url, reference_filename } = await req.json();

    // Create analysis record
    const analysis = await base44.entities.ReferenceAnalysis.create({
      title: title || reference_filename,
      reference_file: reference_file_url,
      reference_filename,
      status: 'analyzing'
    });

    // Use AI to analyze the audio
    const analysisPrompt = `Analyze this audio reference track and provide detailed mixing insights:

1. EQ Curve: Analyze the frequency response across the spectrum (sub-bass 20-60Hz, bass 60-250Hz, low-mid 250-500Hz, mid 500Hz-2kHz, high-mid 2-4kHz, presence 4-6kHz, brilliance 6-20kHz)
2. Dynamic Range: Assess compression, loudness, and dynamic processing
3. Stereo Width: Evaluate stereo field distribution and spatial characteristics
4. LUFS: Estimate integrated loudness
5. Peak levels
6. Actionable guidance for matching this reference

Provide response as detailed technical analysis with specific recommendations.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [reference_file_url],
      response_json_schema: {
        type: "object",
        properties: {
          eq_curve: {
            type: "object",
            properties: {
              frequencies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    freq: { type: "string" },
                    level: { type: "number" }
                  }
                }
              },
              analysis: { type: "string" }
            }
          },
          dynamic_range: {
            type: "object",
            properties: {
              dynamic_range: { type: "number" },
              compression_level: { type: "string" },
              analysis: { type: "string" }
            }
          },
          stereo_width: {
            type: "object",
            properties: {
              width_percentage: { type: "number" },
              analysis: { type: "string" }
            }
          },
          lufs: { type: "number" },
          peak_db: { type: "number" },
          guidance: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Update analysis with results
    await base44.entities.ReferenceAnalysis.update(analysis.id, {
      status: 'done',
      analysis_data: aiResponse,
      eq_curve: aiResponse.eq_curve || {},
      dynamic_range: aiResponse.dynamic_range || {},
      stereo_width: aiResponse.stereo_width || {},
      lufs: aiResponse.lufs || -14,
      peak_db: aiResponse.peak_db || -1,
      guidance: aiResponse.guidance || []
    });

    return Response.json({ status: 'success', analysis_id: analysis.id });
  } catch (error) {
    console.error('Error analyzing reference:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});