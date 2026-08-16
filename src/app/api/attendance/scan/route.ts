import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, session_id } = await req.json();

    if (!token) return NextResponse.json({ error: 'No QR token provided' }, { status: 400 });
    if (!session_id) return NextResponse.json({ error: 'No session selected' }, { status: 400 });

    // Fetch person and session concurrently to save 50% latency
    const [person, session] = await Promise.all([
      prisma.person.findUnique({ where: { qr_token: token } }),
      prisma.session.findUnique({ where: { id: session_id } })
    ]);

    if (!person) return NextResponse.json({ error: 'This QR code is not active.' }, { status: 404 });
    if (person.qr_status !== 'Active') return NextResponse.json({ error: 'This QR code has been revoked.' }, { status: 403 });

    if (!session) return NextResponse.json({ error: 'Invalid session selected.' }, { status: 400 });
    if (session.status !== 'Active') return NextResponse.json({ error: 'This session is closed. Attendance cannot be marked.' }, { status: 403 });

    try {
      const attendance = await prisma.attendance.create({
        data: {
          person_id: person.id,
          session_id: session.id,
          status: 'Present',
          scanned_at: new Date()
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        person: { name: person.name, id: person.organization_person_id },
        session: { name: session.name },
        timestamp: attendance.scanned_at
      });

    } catch (dbError: any) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Attendance already recorded for this session.', 
          already_marked: true,
          person: { name: person.name, id: person.organization_person_id }
        }, { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
