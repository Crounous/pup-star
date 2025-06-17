import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Study } from '@/app/types/study';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studyId = params.id;
    const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
    
    // Read the current studies file
    const studiesContent = fs.readFileSync(studiesPath, 'utf8');
    
    // Extract the studies object content
    const studiesMatch = studiesContent.match(/export const studies: StudiesData = ({[\s\S]*})/);
    if (!studiesMatch) {
      throw new Error('Invalid studies file format');
    }

    // Parse the studies object
    const studiesStr = studiesMatch[1];
    const studiesObj = eval(`(${studiesStr})`);

    // Delete the study
    if (!studiesObj[studyId]) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // Get the PDF URL before deleting
    const pdfUrl = studiesObj[studyId].pdfUrl;

    // Delete the study from the object
    delete studiesObj[studyId];

    // Create the new file content
    const newContent = `import { StudiesData } from '../types/study'

export const studies: StudiesData = ${JSON.stringify(studiesObj, null, 2)}`;

    // Write the updated content back to studies.ts
    fs.writeFileSync(studiesPath, newContent);

    // Delete the PDF file if it exists
    if (pdfUrl) {
      const pdfPath = path.join(process.cwd(), 'public', pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting study:', error);
    return NextResponse.json(
      { error: 'Failed to delete study' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const studyData = JSON.parse(formData.get('studyData') as string) as Study;
    const file = formData.get('file') as File | null;

    // Read the current studies.ts file
    const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
    const studiesContent = fs.readFileSync(studiesPath, 'utf-8');

    // Extract the studies object content
    const studiesMatch = studiesContent.match(/export const studies: StudiesData = ({[\s\S]*})/);
    if (!studiesMatch) {
      throw new Error('Could not find studies object in file');
    }

    // Parse the studies object
    const studiesStr = studiesMatch[1];
    const studies = eval(`(${studiesStr})`);

    // Update the study
    studies[params.id] = studyData;

    // Handle file upload if a new file is provided
    if (file) {
      const papersDir = path.join(process.cwd(), 'public', 'papers');
      if (!fs.existsSync(papersDir)) {
        fs.mkdirSync(papersDir, { recursive: true });
      }

      const filePath = path.join(papersDir, file.name);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);
    }

    // Create the new file content
    const newContent = `import { StudiesData } from '../types/study'

export const studies: StudiesData = ${JSON.stringify(studies, null, 2)}`;

    // Write the updated content back to studies.ts
    fs.writeFileSync(studiesPath, newContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating research:', error);
    return NextResponse.json(
      { error: 'Failed to update research' },
      { status: 500 }
    );
  }
} 