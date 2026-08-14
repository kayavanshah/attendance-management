'use client';

import { useState, useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        setNewStaff({ name: '', email: '', password: '' });
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create staff');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Manage Staff Accounts */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={24} color="var(--primary)" />
            Manage Staff Accounts
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Staff members can only access the Scanner tab. They cannot view analytics, reports, or settings.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
            
            {/* Create Form */}
            <div style={{ flex: '1 1 300px' }}>
            <form onSubmit={handleCreateStaff} style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Staff</h3>
              <div className="mb-4">
                <label className="label">Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="label">Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={newStaff.password}
                  onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                  required 
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Staff Account'}
              </button>
            </form>
            </div>

            {/* List */}
            <div style={{ flex: '2 1 300px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Staff Accounts</h3>
              {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading staff...</div>
              ) : staff.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No staff accounts found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {staff.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background-end)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                      </div>
                      <button 
                        onClick={() => handleDeleteStaff(member.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                        title="Delete Account"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Change Super Admin Password */}
        <div className="glass" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Change My Password</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Password update functionality can be connected here.') }}>
            <div className="mb-4">
              <label className="label">Current Password</label>
              <input type="password" className="input-field" placeholder="Enter current password" />
            </div>
            <div className="mb-4">
              <label className="label">New Password</label>
              <input type="password" className="input-field" placeholder="Enter new password" />
            </div>
            <div className="mb-4">
              <label className="label">Confirm New Password</label>
              <input type="password" className="input-field" placeholder="Confirm new password" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
