import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await prisma.session.update({
      where: { id },
      data: { status: 'Closed' }
    });

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to close session' }, { status: 500 });
  }
}
