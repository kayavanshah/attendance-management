'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?from=${dateFrom}&to=${dateTo}`);
      const data = await res.json();
      if (Array.isArray(data)) setAttendance(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFrom, dateTo]);

  const exportCSV = () => {
    const headers = ['Member ID', 'Name', 'Session', 'Date', 'Time', 'Status'];
    const rows = attendance.map(record => [
      record.person.organization_person_id,
      record.person.name,
      record.session.name,
      format(new Date(record.scanned_at), 'dd MMM yyyy'),
      format(new Date(record.scanned_at), 'hh:mm:ss a'),
      record.status
    ]);
    
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 22);
    
    const tableColumn = ["ID", "Name", "Session", "Date", "Time", "Status"];
    const tableRows = attendance.map(record => [
      record.person.organization_person_id,
      record.person.name,
      record.session.name,
      format(new Date(record.scanned_at), 'dd MMM yyyy'),
      format(new Date(record.scanned_at), 'hh:mm a'),
      record.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
    
    doc.save(`Attendance_Report_${dateFrom}_to_${dateTo}.pdf`);
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Attendance Reports</h1>
      
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input-field" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input-field" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <button onClick={exportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
              <Download size={18} /> Export CSV
            </button>
            <button onClick={exportPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', backgroundColor: '#ef4444' }}>
              <Printer size={18} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>Member ID</th>
              <th style={{ padding: '1rem 0.5rem' }}>Name</th>
              <th style={{ padding: '1rem 0.5rem' }}>Session</th>
              <th style={{ padding: '1rem 0.5rem' }}>Date & Time</th>
              <th style={{ padding: '1rem 0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : attendance.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No attendance records found for this period.</td></tr>
            ) : (
              attendance.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{record.person.organization_person_id}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{record.person.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{record.session.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div>{format(new Date(record.scanned_at), 'dd MMM yyyy')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{format(new Date(record.scanned_at), 'hh:mm a')}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{record.status}</span>
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
