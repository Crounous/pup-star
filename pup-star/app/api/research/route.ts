import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment check and client setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}
// Initialize Supabase client with timeout settings
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


// Configuration
const BUCKET_NAME = 'papers';

// Simple logging functions
function logInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

function logError(message: string, error?: any) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('   Details:', error.message || error);
  }
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

async function uploadPdfToSupabase(file: File, studyId: string): Promise<string> {
    const fileName = `study-${studyId}-${Date.now()}.pdf`;
    logInfo(`Uploading PDF: ${fileName}`);
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, arrayBuffer, { contentType: 'application/pdf' });

    if (error) { throw new Error(`Upload failed: ${error.message}`); }

    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    logSuccess(`PDF uploaded: ${publicUrl}`);
    return publicUrl;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const studyId = params.id;
  if (!studyId) {
    return NextResponse.json({ error: 'Study ID is required' }, { status: 400 });
  }

  logInfo(`Received PUT request for study ID: ${studyId}`);

  try {
    const formData = await request.formData();
    const studyDataString = formData.get('studyData') as string | null;
    const file = formData.get('file') as File | null;

    if (!studyDataString) {
      return NextResponse.json({ error: 'Missing study data' }, { status: 400 });
    }

    const frontendData = JSON.parse(studyDataString);
    logInfo(`Updating study: "${frontendData.title}"`);

    const updatePayload: { [key: string]: any } = {
        title: frontendData.title,
        authors: frontendData.authors,
        year: frontendData.year,
        course: frontendData.course,
        abstract: frontendData.abstract,
        sections: frontendData.sections,
        date_published: frontendData.datePublished,
    };
    
    if (file) {
      logInfo(`Processing new file for update: ${file.name}`);
      const newPdfUrl = await uploadPdfToSupabase(file, studyId);
      updatePayload.pdf_url = newPdfUrl;
    } else {
        updatePayload.pdf_url = frontendData.pdfUrl || frontendData.pdf_url;
    }

    logInfo('Updating record in Supabase database...');
    const { data, error } = await supabase
      .from('studies')
      .update(updatePayload)
      .eq('id', studyId)
      .select()
      .single();

    if (error) {
      logError('Supabase update failed', error);
      throw error;
    }

    logSuccess(`Successfully updated study ID: ${studyId}`);
    return NextResponse.json(data);
    
  } catch (error: any) {
    logError(`Error updating study ID: ${studyId}`, error);
    return NextResponse.json(
      { error: 'Failed to update study', details: error.message },
      { status: 500 }
    );
  }
}


