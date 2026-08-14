import { prisma } from '@/lib/db';
import { generateQRCodeWithLabel } from '@/lib/qr';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import styles from './qr.module.css';
import PrintButton from './PrintButton';

export default async function QRCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const person = await prisma.person.findUnique({
    where: { id }
  });

  if (!person) {
    redirect('/dashboard/people');
  }

  // Generate the Data URL for the QR token
  const qrDataUrl = await generateQRCodeWithLabel(person.qr_token, person.name, person.organization_person_id);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/people" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Member QR Card</h1>
      </div>

      <div className={styles.qrCardContainer}>
        <div className={styles.qrCard} id="printable-qr-card">
          <div className={styles.cardHeader}>
            <div className={styles.orgName}>ORGANIZATION NAME</div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.personName}>{person.name}</div>
            <div className={styles.personId}>ID: {person.organization_person_id}</div>
            
            <img src={qrDataUrl} alt={`QR Code for ${person.name}`} className={styles.qrImage} />
            
            <div className={styles.instruction}>Scan for Attendance</div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <PrintButton />
        <a 
          href={qrDataUrl} 
          download={`QR_${person.organization_person_id}.png`}
          className="btn-primary" 
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--success)' }}
        >
          <Download size={18} /> Download Image
        </a>
      </div>
    </div>
  );
}
