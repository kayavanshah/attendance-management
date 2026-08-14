'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSummary(null);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/people/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import');
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/people" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Import from Excel</h1>
      </div>

      <div className="glass" style={{ padding: '2rem', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <p>Please upload an Excel file (.xlsx or .xls) containing the following columns:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontWeight: 500 }}>
            <li>ID (or id)</li>
            <li>Name</li>
            <li>Age</li>
            <li>Phone Number (or Phone)</li>
          </ul>
        </div>

        <div style={{ 
          border: '2px dashed var(--border)', 
          borderRadius: '8px', 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          marginBottom: '1.5rem'
        }}>
          <input 
            type="file" 
            id="excelFile" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <label htmlFor="excelFile" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={48} color={file ? 'var(--primary)' : 'var(--text-secondary)'} />
            {file ? (
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{file.name}</span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Click to select Excel file</span>
            )}
          </label>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', color: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <button 
          onClick={handleImport} 
          disabled={!file || loading} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Upload size={18} />
          {loading ? 'Importing...' : 'Start Import'}
        </button>
      </div>

      {summary && (
        <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Import Summary</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{summary.total}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Rows</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--success)', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{summary.successes}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Successfully Imported</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--danger)', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{summary.duplicate_ids + summary.skips + summary.errors}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>Failed / Skipped</div>
            </div>
          </div>

          {(summary.errorDetails && summary.errorDetails.length > 0) && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#b45309', marginBottom: '1rem' }}>
                <AlertTriangle size={18} /> Details
              </h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#92400e', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                {summary.errorDetails.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
