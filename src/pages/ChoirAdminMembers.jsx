import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Check, X } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

export default function ChoirAdminMembers() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const choirId = queryParams.get('choirId');
  const [choir, setChoir] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate(createPageUrl('Choir'));
          return;
        }

        // Fetch choir
        const choirData = await base44.asServiceRole.entities.Choir.get(choirId);
        if (!choirData) {
          setError('Choir not found');
          setLoading(false);
          return;
        }
        setChoir(choirData);

        // Verify user is director/admin
        const userMems = await base44.asServiceRole.entities.ChoirMembership.filter({
          choir_id: choirId,
          user_id: user.id,
          status: 'approved',
        });
        if (!userMems.length || !['director', 'admin'].includes(userMems[0].role)) {
          setError('You do not have permission to manage this choir');
          setLoading(false);
          return;
        }

        // Fetch pending requests
        const pending = await base44.asServiceRole.entities.ChoirMembership.filter({
          choir_id: choirId,
          status: 'pending',
        });
        setPendingRequests(pending);

        // Fetch approved members
        const approved = await base44.asServiceRole.entities.ChoirMembership.filter({
          choir_id: choirId,
          status: 'approved',
        });
        setApprovedMembers(approved);

        setLoading(false);
      } catch (err) {
        console.error('Error loading choir data:', err);
        setError('Failed to load choir data');
        setLoading(false);
      }
    };

    loadData();
  }, [choirId]);

  const handleApprove = async (memberId) => {
    setProcessing(prev => ({ ...prev, [memberId]: true }));
    try {
      await base44.functions.invoke('approveMember', {
        membership_id: memberId,
        status: 'approved',
      });
      setPendingRequests(prev => prev.filter(m => m.id !== memberId));
      const approved = pendingRequests.find(m => m.id === memberId);
      if (approved) setApprovedMembers(prev => [...prev, { ...approved, status: 'approved' }]);
    } catch (err) {
      console.error('Error approving member:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleReject = async (memberId) => {
    setProcessing(prev => ({ ...prev, [memberId]: true }));
    try {
      await base44.functions.invoke('approveMember', {
        membership_id: memberId,
        status: 'rejected',
      });
      setPendingRequests(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error rejecting member:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [memberId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} />
      </div>
    );
  }

  if (error || !choir) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(createPageUrl('Choir'))} className="inline-flex items-center gap-1.5 text-xs mb-6" style={{ color: '#9CB2D6' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#FF4D6D10', border: '1px solid #FF4D6D30', color: '#FF4D6D' }}>
          {error || 'Choir not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(createPageUrl('Choir'))} className="inline-flex items-center gap-1.5 text-xs mb-6" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Choir
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#EAF2FF' }}>Manage Members</h1>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>{choir.name}</p>
      </div>

      {/* Pending Requests */}
      <Card className="mb-6">
        <CardHeader
          title={`Pending Requests (${pendingRequests.length})`}
          subtitle="Approve or reject membership requests"
        />
        {pendingRequests.length === 0 ? (
          <p className="text-sm" style={{ color: '#9CB2D6' }}>No pending requests</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>{req.user_name}</p>
                  <p className="text-xs" style={{ color: '#9CB2D6' }}>{req.user_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processing[req.id]}
                    className="px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ backgroundColor: '#19D3A220', color: '#19D3A2' }}
                  >
                    {processing[req.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processing[req.id]}
                    className="px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ backgroundColor: '#FF4D6D20', color: '#FF4D6D' }}
                  >
                    {processing[req.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approved Members */}
      <Card>
        <CardHeader title={`Members (${approvedMembers.length})`} subtitle="Approved choir members" />
        {approvedMembers.length === 0 ? (
          <p className="text-sm" style={{ color: '#9CB2D6' }}>No approved members yet</p>
        ) : (
          <div className="space-y-2">
            {approvedMembers.map(mem => (
              <div key={mem.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>{mem.user_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: '#9CB2D6' }}>{mem.user_email}</p>
                    {mem.part && mem.part !== 'none' && (
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: '#1EA0FF20', color: '#1EA0FF', textTransform: 'capitalize' }}>
                        {mem.part}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#19D3A220', color: '#19D3A2', textTransform: 'capitalize' }}>
                  {mem.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}