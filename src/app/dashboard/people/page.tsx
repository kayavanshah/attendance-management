'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Upload, QrCode, Trash2, UserPlus, Download } from 'lucide-react';

export default function PeoplePage() {
  const [people, setPeople] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/people?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person? Their attendance records will also be deleted.')) return;
    try {
      await fetch(`/api/people/${id}`, { method: 'DELETE' });
      fetchPeople();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>People Directory</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href="/api/people/export-qr"
            className="btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              width: 'auto',
              backgroundColor: 'var(--success)',
              textDecoration: 'none'
            }}
          >
            <Download size={18} /> Bulk Download QR
          </a>
          <Link href="/dashboard/people/import" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <Upload size={18} /> Import Excel
          </Link>
          <Link href="/dashboard/people/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <UserPlus size={18} /> Add Person
          </Link>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by ID, Name, or Phone..." 
            style={{ paddingLeft: '3rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>ID</th>
                <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                <th style={{ padding: '1rem 0.5rem' }}>Age</th>
                <th style={{ padding: '1rem 0.5rem' }}>Phone</th>
                <th style={{ padding: '1rem 0.5rem' }}>QR Status</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
              ) : people.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No people found.</td></tr>
              ) : (
                people.map(person => (
                  <tr key={person.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{person.organization_person_id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{person.name}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{person.age}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{person.phone}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: person.qr_status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: person.qr_status === 'Active' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {person.qr_status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link href={`/dashboard/people/${person.id}/qr`} className="btn-primary" style={{ padding: '0.5rem', width: 'auto', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                        <QrCode size={18} />
                      </Link>
                      <button onClick={() => handleDelete(person.id)} className="btn-primary" style={{ padding: '0.5rem', width: 'auto', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
