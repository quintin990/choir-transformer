import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SongReadinessTracker({ choirId, choirSongId }) {
  const [readinessData, setReadinessData] = useState([]);
  const [summary, setSummary] = useState({ mastered: 0, learning: 0, needHelp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const readiness = await base44.entities.SongReadiness.filter({
          choir_song_id: choirSongId,
        });
        
        const counts = { mastered: 0, learning: 0, need_help: 0 };
        readiness.forEach(r => {
          const key = r.status.replace('need_help', 'need_help');
          counts[key] = (counts[key] || 0) + 1;
        });

        setSummary({
          mastered: counts.mastered || 0,
          learning: counts.learning || 0,
          needHelp: counts.need_help || 0,
        });

        // Chart data
        setReadinessData([
          { name: 'Mastered', value: counts.mastered || 0, fill: '#19D3A2' },
          { name: 'Learning', value: counts.learning || 0, fill: '#1EA0FF' },
          { name: 'Need Help', value: counts.need_help || 0, fill: '#FF6B9D' },
        ]);
      } catch (err) {
        console.error('Error fetching readiness:', err);
      } finally {
        setLoading(false);
      }
    };

    if (choirSongId) {
      fetchReadiness();
    }
  }, [choirSongId]);

  const total = summary.mastered + summary.learning + summary.needHelp;
  const masteredPercent = total > 0 ? Math.round((summary.mastered / total) * 100) : 0;

  if (loading) {
    return (
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <p style={{ color: '#6A8AAD' }}>Loading readiness data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5" style={{ color: '#19D3A2' }} />
        <h3 className="text-lg font-semibold" style={{ color: '#EAF2FF' }}>
          Song Readiness
        </h3>
      </div>

      {total === 0 ? (
        <p className="text-center text-sm py-6" style={{ color: '#6A8AAD' }}>
          No readiness data yet. Members will update their status as they learn.
        </p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#19D3A210' }}>
              <p className="text-2xl font-bold" style={{ color: '#19D3A2' }}>
                {summary.mastered}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6A8AAD' }}>Mastered</p>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#1EA0FF10' }}>
              <p className="text-2xl font-bold" style={{ color: '#1EA0FF' }}>
                {summary.learning}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6A8AAD' }}>Learning</p>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#FF6B9D10' }}>
              <p className="text-2xl font-bold" style={{ color: '#FF6B9D' }}>
                {summary.needHelp}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6A8AAD' }}>Need Help</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#9CB2D6' }}>
                Choir Readiness
              </span>
              <span className="text-sm font-bold" style={{ color: '#19D3A2' }}>
                {masteredPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1C2A44' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${masteredPercent}%`,
                  background: 'linear-gradient(90deg, #19D3A2 0%, #1EA0FF 100%)',
                }}
              />
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={readinessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2A44" />
              <XAxis dataKey="name" stroke="#6A8AAD" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6A8AAD" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', borderRadius: '8px' }}
                labelStyle={{ color: '#EAF2FF' }}
              />
              <Bar dataKey="value" fill="#1EA0FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}