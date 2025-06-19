import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Environment check and client setup
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

// Initialize Supabase client with timeout settings
const supabase = USE_SUPABASE 
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      // Add timeout configuration
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'nextjs-api'
        }
      }
    })
  : null;

// Configuration
const BUCKET_NAME = 'papers';
const UPLOAD_TIMEOUT = 30000; // 30 seconds timeout

// Log the storage method being used
console.log(`🗄️  Storage Method: ${USE_SUPABASE ? 'SUPABASE DATABASE' : 'LOCAL FILE SYSTEM'}`);

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

// Promise with timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Simplified Supabase PDF upload
async function uploadPdfToSupabase(file: File, studyId: string): Promise<string> {
  const fileName = `study-${studyId}-${Date.now()}.pdf`;
  
  logInfo(`Uploading PDF: ${fileName} (${file.size} bytes)`);
  
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Upload with timeout - fix the Promise issue
  const { data, error } = await withTimeout(
    supabase!.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: 'application/pdf'
      }),
    UPLOAD_TIMEOUT
  );
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase!.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);
  
  logSuccess(`PDF uploaded: ${publicUrl}`);
  return publicUrl;
}

// Local file operations (simplified)
async function readLocalStudies() {
  const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
  const studiesContent = fs.readFileSync(studiesPath, 'utf8');
  const studiesMatch = studiesContent.match(/export const studies: StudiesData = ({[\s\S]*})/);
  if (!studiesMatch) throw new Error('Invalid studies file format');
  return eval(`(${studiesMatch[1]})`);
}

async function writeLocalStudies(studiesObj: any) {
  const studiesPath = path.join(process.cwd(), 'app', 'data', 'studies.ts');
  const newContent = `import { StudiesData } from '../types/study'

export const studies: StudiesData = ${JSON.stringify(studiesObj, null, 2)}`;
  fs.writeFileSync(studiesPath, newContent);
}

async function uploadFileLocally(file: File): Promise<string> {
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 Request received');
  
  try {
    // Add overall request timeout
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request exceeded 60 seconds, may timeout soon...');
    }, 60000);

    logInfo(`Creating new study using ${USE_SUPABASE ? 'Supabase' : 'local storage'}`);
    
    // Parse form data
    const formData = await request.formData();
    const studyData = JSON.parse(formData.get('studyData') as string);
    const file = formData.get('file') as File | null;

    logInfo(`Study: "${studyData.title}" by ${studyData.authors?.join(', ') || 'Unknown'}`);

    // Handle PDF file upload
    let pdfUrl: string | undefined;
    if (file) {
      logInfo(`Processing file: ${file.name} (${Math.round(file.size / 1024)}KB)`);
      
      try {
        if (USE_SUPABASE) {
          pdfUrl = await uploadPdfToSupabase(file, studyData.id);
        } else {
          pdfUrl = await uploadFileLocally(file);
        }
        studyData.pdfUrl = pdfUrl;
        logSuccess(`File uploaded successfully`);
      } catch (uploadError) {
        logError('File upload failed', uploadError);
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'Failed to upload PDF file', details: uploadError instanceof Error ? uploadError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Save study data
    if (USE_SUPABASE) {
      logInfo('Saving to Supabase database...');
      
      const insertQuery = supabase!.from('studies').insert([{
        id: studyData.id,
        title: studyData.title,
        course: studyData.course,
        year: studyData.year,
        authors: studyData.authors,
        abstract: studyData.abstract,
        pdf_url: studyData.pdfUrl,
        date_published: studyData.datePublished,
        sections: studyData.sections
      }]).select();


const { error } = await withTimeout(Promise.resolve(insertQuery), 15000);

      if (error) {
        logError('Database insert failed', error);
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'Failed to save study to database', details: error.message },
          { status: 500 }
        );
      }
      
      logSuccess('Study saved to Supabase');
    } else {
      logInfo('Saving to local file...');
      const studiesObj = await readLocalStudies();
      studiesObj[studyData.id] = studyData;
      await writeLocalStudies(studiesObj);
      logSuccess('Study saved to local file');
    }

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    logSuccess(`Study "${studyData.title}" created successfully in ${duration}ms`);

    return NextResponse.json({ 
      success: true, 
      message: `Study created successfully`,
      studyId: studyData.id,
      duration
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`Error creating study after ${duration}ms`, error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create study',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration
      },
      { status: 500 }
    );
  }
}