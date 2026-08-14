import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSecureToken } from '@/lib/qr';
import * as xlsx from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows = xlsx.utils.sheet_to_json<any>(sheet);
    
    let successes = 0;
    let skips = 0;
    let errors = 0;
    let duplicate_ids = 0;
    const errorDetails = [];

    for (const row of rows) {
      // Normalize row keys (lowercase and trimmed)
      const normalizedRow: any = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        }
      }

      // Map columns robustly
      const orgId = normalizedRow['id']?.toString();
      const name = normalizedRow['name'];
      const age = parseInt(normalizedRow['age']);
      const phone = normalizedRow['phone number']?.toString() || 
                    normalizedRow['mobile number']?.toString() || 
                    normalizedRow['mobile no']?.toString() || 
                    normalizedRow['phone']?.toString() || 
                    normalizedRow['mobile']?.toString();

      if (!orgId || !name || isNaN(age) || !phone) {
        skips++;
        errorDetails.push(`Row missing data: ${JSON.stringify(row)}`);
        continue;
      }

      try {
        const exists = await prisma.person.findUnique({
          where: { organization_person_id: orgId }
        });

        if (exists) {
          duplicate_ids++;
          continue;
        }

        await prisma.person.create({
          data: {
            organization_person_id: orgId,
            name,
            age,
            phone,
            qr_token: generateSecureToken(),
          }
        });
        successes++;
      } catch (err: any) {
        errors++;
        errorDetails.push(`Error inserting ID ${orgId}: ${err.message}`);
      }
    }

    return NextResponse.json({
      summary: {
        total: rows.length,
        successes,
        skips,
        errors,
        duplicate_ids,
        errorDetails
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process file: ' + error.message }, { status: 500 });
  }
}
