import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const studyData = JSON.parse(formData.get('studyData') as string);
    const file = formData.get('file') as File | null;

    // Handle PDF file upload
    if (file) {
      // Create papers directory if it doesn't exist
      const papersDir = path.join(process.cwd(), 'public', 'papers');
      if (!fs.existsSync(papersDir)) {
        fs.mkdirSync(papersDir, { recursive: true });
      }

      // Save the file
      const filePath = path.join(papersDir, file.name);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
    }

    // Read the current studies file
    const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
    const studiesContent = fs.readFileSync(studiesPath, 'utf8');

    // Extract the studies object content
    const studiesMatch = studiesContent.match(/export const studies: StudiesData = ({[\s\S]*})/);
    if (!studiesMatch) {
      throw new Error('Invalid studies file format');
    }

    // Parse the studies object
    const studiesStr = studiesMatch[1];
    const studiesObj = eval(`(${studiesStr})`);

    // Add the new study
    studiesObj[studyData.id] = studyData;

    // Create the new file content
    const newContent = `import { StudiesData } from '../types/study'

export const studies: StudiesData = ${JSON.stringify(studiesObj, null, 2)}`;

    // Write the updated content back to studies.ts
    fs.writeFileSync(studiesPath, newContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding study:', error);
    return NextResponse.json(
      { error: 'Failed to add study' },
      { status: 500 }
    );
  }
} 