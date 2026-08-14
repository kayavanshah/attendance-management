import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQRCodeWithLabel } from '@/lib/qr';
import AdmZip from 'adm-zip';

export async function GET() {
  try {
    const people = await prisma.person.findMany();
    
    if (people.length === 0) {
      return NextResponse.json({ error: 'No members found' }, { status: 404 });
    }

    const zip = new AdmZip();

    for (const person of people) {
      const dataUrl = await generateQRCodeWithLabel(person.qr_token, person.name, person.organization_person_id);
      if (dataUrl) {
        // Strip the data:image/png;base64, part
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Clean filename to prevent issues
        const safeName = person.name.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${person.organization_person_id}_${safeName}.png`;
        
        zip.addFile(filename, buffer);
      }
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="QR_Codes_Bulk.zip"'
      }
    });

  } catch (error) {
    console.error('Failed to generate zip:', error);
    return NextResponse.json({ error: 'Failed to generate bulk QR package' }, { status: 500 });
  }
}
