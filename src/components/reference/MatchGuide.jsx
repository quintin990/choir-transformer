import React, { useState } from 'react';
import { Download, Volume2, Sliders, Zap } from 'lucide-react';

export default function MatchGuide({ referenceAnalysis, userJob }) {
  const [showPDF, setShowPDF] = useState(false);

  if (!referenceAnalysis) {
    return (
      <div className="text-center py-12" style={{ color: 'hsl(var(--color-muted))' }}>
        <p>No reference analysis available</p>
      </div>
    );
  }

  // Generate recommendations based on reference vs user data
  const generateRecommendations = () => {
    const ref = referenceAnalysis;
    const recommendations = {
      eq: [],
      compression: [],
      stereo: [],
    };

    // EQ Recommendations based on frequency balance
    if (ref.eq_curve) {
      if (ref.eq_curve.low_end < -6) {
        recommendations.eq.push({
          band: 'Low (80-250Hz)',
          suggestion: 'Boost 2-4 dB',
          reason: 'Reference has prominent lows',
        });
      }
      if (ref.eq_curve.mids < -3) {
        recommendations.eq.push({
          band: 'Mids (250Hz-2kHz)',
          suggestion: 'Cut 1-2 dB at 1kHz',
          reason: 'Reference is scooped in mids',
        });
      }
      if (ref.eq_curve.high_end > 3) {
        recommendations.eq.push({
          band: 'High (3-12kHz)',
          suggestion: 'Boost 2-3 dB',
          reason: 'Reference has bright, airy highs',
        });
      }
    }

    // Compression recommendations
    if (ref.dynamic_range) {
      if (ref.dynamic_range.range_db > 15) {
        recommendations.compression.push({
          param: 'Ratio',
          suggestion: '3:1 or less',
          reason: 'Reference allows more dynamic range',
        });
      } else {
        recommendations.compression.push({
          param: 'Ratio',
          suggestion: '4:1 or higher',
          reason: 'Reference is heavily compressed',
        });
      }

      if (ref.dynamic_range.crest_factor > 12) {
        recommendations.compression.push({
          param: 'Attack',
          suggestion: '5-10 ms',
          reason: 'Quick attack to control peaks',
        });
      }
    }

    // Stereo recommendations
    if (ref.stereo_width) {
      if (ref.stereo_width.width_percent > 80) {
        recommendations.stereo.push({
          param: 'Stereo Width',
          suggestion: 'Increase to 80-100%',
          reason: 'Reference has wide stereo image',
        });
      } else if (ref.stereo_width.width_percent < 40) {
        recommendations.stereo.push({
          param: 'Stereo Width',
          suggestion: 'Reduce to 30-50%',
          reason: 'Reference is relatively narrow',
        });
      }

      if (ref.stereo_width.correlation > 0.7) {
        recommendations.stereo.push({
          param: 'Center Content',
          suggestion: 'Mono sum-friendly',
          reason: 'Reference maintains strong center image',
        });
      }
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const downloadPDF = () => {
    // Placeholder: In production, use jsPDF to generate actual PDF
    const content = `
Match Guide Report
==================

Reference: ${referenceAnalysis.title}
Target LUFS: ${referenceAnalysis.lufs?.toFixed(1)} LUFS
Peak: ${referenceAnalysis.peak_db?.toFixed(1)} dB

EQ Recommendations:
${recommendations.eq.map(r => `- ${r.band}: ${r.suggestion}\n  (${r.reason})`).join('\n')}

Compression Settings:
${recommendations.compression.map(r => `- ${r.param}: ${r.suggestion}\n  (${r.reason})`).join('\n')}

Stereo Adjustments:
${recommendations.stereo.map(r => `- ${r.param}: ${r.suggestion}\n  (${r.reason})`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-guide-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Match Your Mix</h2>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--color-muted))' }}>
              Reference: <strong>{referenceAnalysis.title}</strong>
            </p>
          </div>
          <button
            onClick={downloadPDF}
            className="px-4 h-10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            <Download className="w-4 h-4" /> Export Guide
          </button>
        </div>

        {/* Reference Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Loudness (LUFS)</p>
            <p className="text-xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>
              {referenceAnalysis.lufs?.toFixed(1) || '-'}
            </p>
          </div>
          <div className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Peak (dB)</p>
            <p className="text-xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>
              {referenceAnalysis.peak_db?.toFixed(1) || '-'}
            </p>
          </div>
          <div className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Headroom</p>
            <p className="text-xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>
              {((0 - (referenceAnalysis.peak_db || -3)).toFixed(1))} dB
            </p>
          </div>
        </div>
      </div>

      {/* EQ Section */}
      {recommendations.eq.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <Sliders className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} /> EQ Adjustments
          </h3>
          <div className="space-y-3">
            {recommendations.eq.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold" style={{ color: 'hsl(var(--color-text))' }}>{rec.band}</p>
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.2)', color: 'hsl(var(--color-primary))' }}>
                    {rec.suggestion}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compression Section */}
      {recommendations.compression.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <Zap className="w-5 h-5" style={{ color: 'hsl(var(--color-accent))' }} /> Compression Settings
          </h3>
          <div className="space-y-3">
            {recommendations.compression.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold" style={{ color: 'hsl(var(--color-text))' }}>{rec.param}</p>
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'hsl(var(--color-accent) / 0.2)', color: 'hsl(var(--color-accent))' }}>
                    {rec.suggestion}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stereo Section */}
      {recommendations.stereo.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <Volume2 className="w-5 h-5" style={{ color: 'hsl(var(--color-secondary))' }} /> Stereo Widening
          </h3>
          <div className="space-y-3">
            {recommendations.stereo.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold" style={{ color: 'hsl(var(--color-text))' }}>{rec.param}</p>
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'hsl(var(--color-secondary))' , color: 'white' }}>
                    {rec.suggestion}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Tips */}
      <div className="rounded-lg p-6 border" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.05)', borderColor: 'hsl(var(--color-primary) / 0.2)' }}>
        <h4 className="font-semibold mb-2" style={{ color: 'hsl(var(--color-text))' }}>💡 Implementation Tips</h4>
        <ul className="text-sm space-y-1" style={{ color: 'hsl(var(--color-muted))' }}>
          <li>• Apply changes gradually and A/B test often</li>
          <li>• Use reference listening at moderate levels</li>
          <li>• Check on multiple speaker systems</li>
          <li>• Target the loudness first, then tone matching</li>
        </ul>
      </div>
    </div>
  );
}