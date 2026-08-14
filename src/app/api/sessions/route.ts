import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const session = await prisma.session.create({
      data: {
        name: data.name,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        status: 'Closed' // Sessions start closed until activated
      }
    });
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
