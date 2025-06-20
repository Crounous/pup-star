import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const BUCKET_NAME = 'papers';

function logError(message: string, error?: any) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('   Details:', error.message || error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studyId } = await params;
  
  try {
    const { data, error } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Study not found' },
          { status: 404 }
        );
      }
      logError('Supabase fetch failed', error);
      throw error;
    }
    
    // Return raw Supabase data without transformation
    return NextResponse.json(data);
    
  } catch (error: any) {
    logError(`Error fetching study ID: ${studyId}`, error);
    return NextResponse.json(
      { error: 'Failed to fetch study', details: error.message },
      { status: 500 }
    );
  }
}

async function uploadPdfToSupabase(file: File, studyId: string): Promise<string> {
  const fileName = `study-${studyId}-${Date.now()}.pdf`;
  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, arrayBuffer, { contentType: 'application/pdf' });

  if (error) { 
    throw new Error(`Upload failed: ${error.message}`); 
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
}

async function deleteFileFromSupabase(url: string): Promise<void> {
  const fileName = url.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName]);
  
  if (error) {
    logError('Failed to delete file from storage', error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studyId } = await params;
  
  if (!studyId) {
    return NextResponse.json({ error: 'Study ID is required' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const studyDataString = formData.get('studyData') as string | null;
    const file = formData.get('file') as File | null;

    if (!studyDataString) {
      return NextResponse.json({ error: 'Missing study data' }, { status: 400 });
    }

    const frontendData = JSON.parse(studyDataString);

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
      const newPdfUrl = await uploadPdfToSupabase(file, studyId);
      updatePayload.pdf_url = newPdfUrl;
      
      if (frontendData.pdfUrl) {
        await deleteFileFromSupabase(frontendData.pdfUrl);
      }
    } else {
      updatePayload.pdf_url = frontendData.pdfUrl || frontendData.pdf_url;
    }

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

    return NextResponse.json(data);
    
  } catch (error: any) {
    logError(`Error updating study ID: ${studyId}`, error);
    return NextResponse.json(
      { error: 'Failed to update study', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studyId } = await params;
  
  try {
    const { data: study, error: fetchError } = await supabase
      .from('studies')
      .select('pdf_url, title')
      .eq('id', studyId)
      .single();

    if (fetchError) {
      logError('Error fetching study for deletion', fetchError);
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    if (study?.pdf_url) {
      await deleteFileFromSupabase(study.pdf_url);
    }

    const { error } = await supabase
      .from('studies')
      .delete()
      .eq('id', studyId);

    if (error) {
      logError('Supabase delete error', error);
      throw error;
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    logError('Error deleting study', error);
    return NextResponse.json(
      { error: 'Failed to delete study' },
      { status: 500 }
    );
  }
}