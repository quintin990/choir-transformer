import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { XCircle } from 'lucide-react';

export default function BillingCancel() {
  return (
    <div className="max-w-md mx-auto text-center py-24 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: '#FF4D6D15' }}>
        <XCircle className="w-7 h-7" style={{ color: '#FF4D6D' }} />
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>
        Checkout cancelled
      </h1>
      <p className="text-sm mb-8" style={{ color: '#9CB2D6' }}>
        No charge was made. You can upgrade anytime from the Pricing page.
      </p>
      <Link to={createPageUrl('Pricing')}
        className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-semibold border"
        style={{ borderColor: '#1C2A44', color: '#EAF2FF' }}>
        Back to Pricing
      </Link>
    </div>
  );
}