import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSecureToken } from '@/lib/qr';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const people = await prisma.person.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { organization_person_id: { contains: search } },
          { phone: { contains: search } },
        ]
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { organization_person_id, name, age, phone } = data;

    if (!organization_person_id || !name || !age || !phone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const exists = await prisma.person.findUnique({
      where: { organization_person_id }
    });

    if (exists) {
      return NextResponse.json({ error: 'Person ID already exists' }, { status: 400 });
    }

    const qr_token = generateSecureToken();

    const person = await prisma.person.create({
      data: {
        organization_person_id,
        name,
        age: parseInt(age),
        phone,
        qr_token,
      }
    });

    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
