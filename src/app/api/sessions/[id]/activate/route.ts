import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Close all other sessions
    await prisma.session.updateMany({
      where: { status: 'Active' },
      data: { status: 'Closed' }
    });

    // Activate this session
    const session = await prisma.session.update({
      where: { id },
      data: { status: 'Active' }
    });

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to activate session' }, { status: 500 });
  }
}
