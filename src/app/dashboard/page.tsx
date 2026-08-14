'use client';

import { useState, useEffect } from 'react';
import { Users, CheckSquare, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/statistics')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Analytics Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Members</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats?.totalPeople || 0}</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckSquare size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Present Today</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats?.attendanceToday || 0}</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: '#f59e0b' }}>
            <Activity size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Session</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stats?.activeSession ? `${stats.activeSession.name}` : 'None'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {stats?.activeSession ? stats.activeSession.date : 'Activate in Sessions'}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Recent Activity</h2>
      <div className="glass" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Time</th>
              <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Member</th>
              <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Session</th>
              <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentActivity?.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem' }}>No recent activity.</td></tr>
            ) : (
              stats?.recentActivity?.map((activity: any) => (
                <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>{format(new Date(activity.scanned_at), 'hh:mm a')}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                    <div>{activity.person.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {activity.person.organization_person_id}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>{activity.session.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Present</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
