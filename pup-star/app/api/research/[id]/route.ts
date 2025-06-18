import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Study } from '@/app/types/study';

// Environment check and client setup
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = USE_SUPABASE 
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

// Log the storage method being used
console.log(`🗄️  Storage Method: ${USE_SUPABASE ? 'SUPABASE DATABASE' : 'LOCAL FILE SYSTEM'}`);
if (USE_SUPABASE) {
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
} else {
  console.log(`📁 Using local studies.ts file`);
}

// Helper functions for local file operations
async function readLocalStudies() {
  const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
  const studiesContent = fs.readFileSync(studiesPath, 'utf8');
  
  const studiesMatch = studiesContent.match(/export const studies: StudiesData = ({[\s\S]*})/);
  if (!studiesMatch) {
    throw new Error('Invalid studies file format');
  }
  
  const studiesStr = studiesMatch[1];
  return eval(`(${studiesStr})`);
}

// upload helpers
const BUCKET_NAME = 'papers';

async function uploadFileToSupabase(file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase!
    .storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) throw error;
  
  return supabase!
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path).data.publicUrl;
}

async function deleteFileFromSupabase(url: string): Promise<void> {
  const filePath = url.split('/').pop()!;
  const { error } = await supabase!
    .storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  
  if (error) console.error('Delete failed:', error);
}

async function writeLocalStudies(studiesObj: any) {
  const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
  const newContent = `import { StudiesData } from '../types/study'

export const studies: StudiesData = ${JSON.stringify(studiesObj, null, 2)}`;
  
  fs.writeFileSync(studiesPath, newContent);
}

async function handleFileUpload(file: File): Promise<string | undefined> {
  if (!file) return undefined;

  if (USE_SUPABASE) {
    return await uploadFileToSupabase(file);
  } else {
    // Existing local file handling
    const papersDir = path.join(process.cwd(), 'public', 'papers');
    if (!fs.existsSync(papersDir)) {
      fs.mkdirSync(papersDir, { recursive: true });
    }
    const filePath = path.join(papersDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    return `/papers/${file.name}`;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studyId = params.id;
    console.log(`🗑️  Deleting study ${studyId} using ${USE_SUPABASE ? 'Supabase' : 'local storage'}`);

    let pdfUrl: string | undefined;
    let studyTitle: string = '';

    if (USE_SUPABASE) {
      // Get the study first to get PDF URL and title
      const { data: study, error: fetchError } = await supabase!
        .from('studies')
        .select('pdf_url, title')
        .eq('id', studyId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching study for deletion:', fetchError);
        return NextResponse.json({ error: 'Study not found' }, { status: 404 });
      }

      pdfUrl = study?.pdf_url;
      studyTitle = study?.title || '';

      // Delete from Supabase
      if (pdfUrl) {
        if (USE_SUPABASE) {
          await deleteFileFromSupabase(pdfUrl);
        } else {
          const pdfPath = path.join(process.cwd(), 'public', pdfUrl);
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        }
    }
      const { error } = await supabase!.from('studies').delete().eq('id', studyId);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }
      
      console.log(`✅ Study "${studyTitle}" deleted successfully from Supabase`);
    } else {
      // Local file operation
      const studiesObj = await readLocalStudies();

      if (!studiesObj[studyId]) {
        console.log('❌ Study not found in local storage');
        return NextResponse.json({ error: 'Study not found' }, { status: 404 });
      }

      pdfUrl = studiesObj[studyId].pdfUrl;
      studyTitle = studiesObj[studyId].title;
      delete studiesObj[studyId];
      await writeLocalStudies(studiesObj);
      
      console.log(`✅ Study "${studyTitle}" deleted successfully from local file`);
    }

    // Delete the PDF file if it exists
    if (pdfUrl) {
      const pdfPath = path.join(process.cwd(), 'public', pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log('✅ PDF file deleted successfully');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting study:', error);
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
    const studyId = params.id;
    console.log(`✏️  Updating study ${studyId} using ${USE_SUPABASE ? 'Supabase' : 'local storage'}`);
    
    const formData = await request.formData();
    const studyData = JSON.parse(formData.get('studyData') as string) as Study;
    const file = formData.get('file') as File | null;

    // Handle file upload if a new file is provided
    if (file) {
      const newPdfUrl = await handleFileUpload(file);
      if (studyData.pdfUrl) {
        if (USE_SUPABASE) {
          await deleteFileFromSupabase(studyData.pdfUrl);
        } else {
          const oldPath = path.join(process.cwd(), 'public', studyData.pdfUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
       studyData.pdfUrl = newPdfUrl;
      console.log(`📎 New file uploaded: ${file.name}`);
    }

    if (USE_SUPABASE) {
      // Supabase operation
      const { data, error } = await supabase!.from('studies').update({
        title: studyData.title,
        course: studyData.course,
        year: studyData.year,
        authors: studyData.authors,
        abstract: studyData.abstract,
        pdf_url: studyData.pdfUrl,
        date_published: studyData.datePublished,
        sections: studyData.sections
      }).eq('id', studyId);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }
      
      console.log(`✅ Study "${studyData.title}" updated successfully in Supabase`);
    } else {
      // Local file operation
      const studiesObj = await readLocalStudies();
      studiesObj[studyId] = studyData;
      await writeLocalStudies(studiesObj);
      
      console.log(`✅ Study "${studyData.title}" updated successfully in local file`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating study:', error);
    return NextResponse.json(
      { error: 'Failed to update research' },
      { status: 500 }
    );
  }
}