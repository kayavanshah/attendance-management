import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    
    const whereClause: any = {};
    if (dateFrom && dateTo) {
      whereClause.scanned_at = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo + 'T23:59:59.999Z')
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        person: true,
        session: true
      },
      orderBy: { scanned_at: 'desc' }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
