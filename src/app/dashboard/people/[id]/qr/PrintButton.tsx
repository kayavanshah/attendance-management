'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="btn-primary" 
      style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <Printer size={18} /> Print Card
    </button>
  );
}
