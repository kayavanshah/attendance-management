import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const person = await prisma.person.update({
      where: { id },
      data: {
        name: data.name,
        age: data.age ? parseInt(data.age) : undefined,
        phone: data.phone,
        qr_status: data.qr_status
      }
    });
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Delete attendance records first
    await prisma.attendance.deleteMany({
      where: { person_id: id }
    });
    await prisma.person.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}
