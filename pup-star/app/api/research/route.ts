import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

// GET function to fetch all studies or a specific study by ID
export async function GET(
  request: NextRequest,
  { params }: { params?: { id?: string } } = {}
) {
  const studyId = params?.id;
  
  if (studyId) {
    logInfo(`Received GET request for study ID: ${studyId}`);
    
    try {
      logInfo('Fetching specific study from Supabase database...');
      
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('id', studyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logError(`Study not found: ${studyId}`);
          return NextResponse.json(
            { error: 'Study not found' },
            { status: 404 }
          );
        }
        logError('Supabase fetch failed', error);
        throw error;
      }

      logSuccess(`Successfully fetched study: ${data.title}`);
      
      // Transform the data to match the expected format in the frontend
      const transformedData = {
        id: data.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        course: data.course,
        abstract: data.abstract,
        sections: data.sections,
        datePublished: data.date_published,
        pdfUrl: data.pdf_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return NextResponse.json(transformedData);
      
    } catch (error: any) {
      logError(`Error fetching study ID: ${studyId}`, error);
      return NextResponse.json(
        { error: 'Failed to fetch study', details: error.message },
        { status: 500 }
      );
    }
  } else {
    // Existing GET logic for all studies
    logInfo('Received GET request for all studies');

    try {
      logInfo('Fetching studies from Supabase database...');
      
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .order('created_at', { ascending: false }); // Order by creation date, newest first

      if (error) {
        logError('Supabase fetch failed', error);
        throw error;
      }

      logSuccess(`Successfully fetched ${data?.length || 0} studies`);
      
      // Transform the data to match the expected format in the frontend
      const transformedData = data?.map(study => ({
        id: study.id,
        title: study.title,
        authors: study.authors,
        year: study.year,
        course: study.course,
        abstract: study.abstract,
        sections: study.sections,
        datePublished: study.date_published,
        pdfUrl: study.pdf_url,
        createdAt: study.created_at,
        updatedAt: study.updated_at
      })) || [];

      return NextResponse.json(transformedData);
      
    } catch (error: any) {
      logError('Error fetching studies', error);
      return NextResponse.json(
        { error: 'Failed to fetch studies', details: error.message },
        { status: 500 }
      );
    }
  }
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