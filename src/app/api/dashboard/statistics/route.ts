import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    
    const totalPeople = await prisma.person.count();
    
    const attendanceToday = await prisma.attendance.count({
      where: {
        scanned_at: { gte: start, lte: end }
      }
    });

    const activeSession = await prisma.session.findFirst({
      where: { status: 'Active' }
    });

    const recentActivity = await prisma.attendance.findMany({
      take: 5,
      orderBy: { scanned_at: 'desc' },
      include: { person: true, session: true }
    });

    return NextResponse.json({
      totalPeople,
      attendanceToday,
      activeSession,
      recentActivity
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
