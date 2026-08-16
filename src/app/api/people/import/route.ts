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

    const validPeople = [];
    const seenIds = new Set();

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

      if (seenIds.has(orgId)) {
        duplicate_ids++;
        continue;
      }
      
      seenIds.add(orgId);
      
      validPeople.push({
        organization_person_id: orgId,
        name,
        age,
        phone,
        qr_token: generateSecureToken(),
      });
    }

    try {
      if (validPeople.length > 0) {
        const result = await prisma.person.createMany({
          data: validPeople,
          skipDuplicates: true
        });
        successes = result.count;
        duplicate_ids += (validPeople.length - result.count);
      }
    } catch (err: any) {
      console.error(err);
      errors = validPeople.length;
      errorDetails.push('Database bulk insert failed: ' + err.message);
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
