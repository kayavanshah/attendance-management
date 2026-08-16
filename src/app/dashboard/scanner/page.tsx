'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Info, Calendar } from 'lucide-react';

export default function ScannerPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
        }
      });
  }, []);

  const startScannerForSession = () => {
    const session = sessions.find(s => s.id === selectedSessionId);
    if (session) {
      setActiveSession(session);
    }
  };

  const changeSession = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setActiveSession(null);
    setSelectedSessionId('');
  };

  const handleScan = async (decodedText: string) => {
    if (isScanning || !activeSession) return;
    setIsScanning(true);
    
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText, session_id: activeSession.id })
      });
      
      const data = await res.json();
      setScanResult({
        success: res.ok,
        status: res.status,
        ...data
      });

      setTimeout(() => {
        setScanResult(null);
        setIsScanning(false);
      }, 3000);

    } catch (err) {
      setScanResult({ success: false, error: 'Network error' });
      setTimeout(() => { setScanResult(null); setIsScanning(false); }, 3000);
    }
  };

  useEffect(() => {
    if (activeSession && !scannerRef.current) {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        scanner.render((text) => handleScan(text), () => {});
        scannerRef.current = scanner;
      }, 100);
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="glass" style={{ padding: '2rem 1.5rem', width: '90%', maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
        <Calendar size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Select Session</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Choose which session you are scanning attendance for.
        </p>
        
        <select 
          className="input-field" 
          value={selectedSessionId} 
          onChange={(e) => setSelectedSessionId(e.target.value)}
          style={{ marginBottom: '1.5rem' }}
        >
          <option value="">-- Select a Session --</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.name} ({session.date})
            </option>
          ))}
        </select>

        <button 
          onClick={startScannerForSession} 
          className="btn-primary" 
          disabled={!selectedSessionId}
        >
          Start Scanning
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Attendance Scanner</h1>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '999px', marginTop: '0.5rem', fontWeight: 600, cursor: 'pointer' }} onClick={changeSession}>
          Scanning for: {activeSession.name} (Click to change)
        </div>
      </div>

      <div className="glass" style={{ padding: '1rem', overflow: 'hidden' }}>
        <div id="reader" style={{ width: '100%', border: 'none' }}></div>
      </div>

      {scanResult && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '500px',
          zIndex: 100,
          background: scanResult.success ? '#10b981' : (scanResult.already_marked ? '#f59e0b' : '#ef4444'),
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {scanResult.success ? (
            <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
          ) : scanResult.already_marked ? (
            <Info size={48} style={{ marginBottom: '1rem' }} />
          ) : (
            <XCircle size={48} style={{ marginBottom: '1rem' }} />
          )}
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {scanResult.success ? 'ATTENDANCE MARKED' : scanResult.already_marked ? 'ALREADY MARKED' : 'SCAN FAILED'}
          </h2>
          
          {scanResult.person && (
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', width: '100%' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{scanResult.person.name}</div>
              <div style={{ opacity: 0.9 }}>ID: {scanResult.person.id}</div>
              {scanResult.success && scanResult.timestamp && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                  Time: {new Date(scanResult.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
          
          {(!scanResult.success && !scanResult.already_marked) && (
            <div style={{ marginTop: '0.5rem' }}>{scanResult.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
