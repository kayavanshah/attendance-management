'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00'
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (res.ok) {
        setShowModal(false);
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSessionStatus = async (id: string, currentStatus: string) => {
    const endpoint = currentStatus === 'Active' ? `/api/sessions/${id}/close` : `/api/sessions/${id}/activate`;
    try {
      await fetch(endpoint, { method: 'POST' });
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Event Sessions</h1>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Session
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>Name</th>
              <th style={{ padding: '1rem 0.5rem' }}>Date</th>
              <th style={{ padding: '1rem 0.5rem' }}>Time</th>
              <th style={{ padding: '1rem 0.5rem' }}>Status</th>
              <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No sessions found.</td></tr>
            ) : (
              sessions.map(session => (
                <tr key={session.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{session.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{session.date}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{session.start_time} - {session.end_time}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: session.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: session.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {session.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => toggleSessionStatus(session.id, session.status)}
                      className="btn-primary" 
                      style={{ 
                        padding: '0.5rem 1rem', 
                        width: 'auto', 
                        fontSize: '0.875rem',
                        backgroundColor: session.status === 'Active' ? 'transparent' : 'var(--primary)',
                        color: session.status === 'Active' ? 'var(--danger)' : 'white',
                        border: session.status === 'Active' ? '1px solid var(--danger)' : 'none'
                      }}
                    >
                      {session.status === 'Active' ? 'Close Session' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: 'var(--background-start)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Create Session</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="label">Session Name (e.g. Day 1 Keynote)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newSession.name} 
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="label">Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={newSession.date} 
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Start Time</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={newSession.start_time} 
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={newSession.end_time} 
                    onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-primary" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
