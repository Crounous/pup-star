import { createClient } from '@supabase/supabase-js'
import { studies } from '@/app/data/studies'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting migration script...')

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET_NAME = 'papers' // Supabase storage bucket name

// Enhanced logging functions
function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logError(message: string, error?: any) {
  console.error(`❌ ${message}`)
  if (error) {
    console.error('   Details:', error.message || error)
  }
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

function logWarning(message: string) {
  console.warn(`⚠️  ${message}`)
}

// Check environment variables
function checkEnvironment() {
  console.log('\n🔍 Checking environment variables...')

  if (!SUPABASE_URL) {
    logError('SUPABASE_URL environment variable is missing')
    return false
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logError('SUPABASE_SERVICE_ROLE_KEY environment variable is missing')
    return false
  }

  logSuccess('Environment variables found')
  logInfo(`Supabase URL: ${SUPABASE_URL}`)
  logInfo(`Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`)

  return true
}

// Initialize Supabase client
function initializeSupabase() {
  try {
    console.log('\n🔌 Initializing Supabase client...')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
    logSuccess('Supabase client initialized')
    return supabase
  } catch (error) {
    logError('Failed to initialize Supabase client', error)
    throw error
  }
}

// Ensure database schema exists
async function ensureSchema(supabase: any) {
  console.log('\n🏗️  Ensuring database schema...')

  try {
    const { data, error: checkError } = await supabase
      .from('studies')
      .select('count', { count: 'exact', head: true })

    if (checkError && checkError.code === 'PGRST116') {
      logInfo('Studies table does not exist, creating...')

      const createTableSql = `
        create table if not exists studies (
          id text primary key,
          title text not null,
          course text not null,
          year integer not null,
          authors text[],
          abstract text,
          pdf_url text,
          date_published text,
          sections jsonb,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );

        create or replace function update_updated_at_column()
        returns trigger as $$
        begin
          new.updated_at = timezone('utc'::text, now());
          return new;
        end;
        $$ language 'plpgsql';

        create trigger update_studies_updated_at
          before update on studies
          for each row
          execute procedure update_updated_at_column();
      `

      const { error: createError } = await supabase.rpc('execute_sql', { sql: createTableSql })

      if (createError) {
        logWarning('RPC method failed, trying direct table creation...')

        const { error: directCreateError } = await supabase
          .from('studies')
          .select('*')
          .limit(1)

        if (directCreateError && directCreateError.code === 'PGRST116') {
          throw new Error('Unable to create table: ' + (createError.message || 'Unknown error'))
        }
      }

      logSuccess('Studies table created successfully')
    } else if (checkError) {
      throw checkError
    } else {
      logSuccess('Studies table already exists')
      logInfo(`Current table has ${data?.length || 0} records`)
    }
  } catch (error) {
    logError('Failed to ensure schema', error)
    throw error
  }
}

// Ensure storage bucket exists
async function ensureStorageBucket(supabase: any) {
  console.log('\n📦 Ensuring storage bucket exists...')
  
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME)
    
    if (error) {
      if (error.message.includes('not found')) {
        logInfo('Creating storage bucket...')
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['application/pdf']
        })
        
        if (createError) throw createError
        logSuccess(`Bucket "${BUCKET_NAME}" created successfully`)
      } else {
        throw error
      }
    } else {
      logSuccess(`Bucket "${BUCKET_NAME}" already exists`)
    }
  } catch (error) {
    logError('Failed to ensure storage bucket', error)
    throw error
  }
}

// Upload PDF to Supabase storage
async function uploadPdfToSupabase(supabase: any, filePath: string, studyId: string): Promise<string> {
  const fileName = `study-${studyId}${path.extname(filePath)}`
  const fileContent = fs.readFileSync(filePath)
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileContent, {
      contentType: 'application/pdf',
      upsert: true
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)
  
  return publicUrl
}

// Test connection to Supabase
async function testConnection(supabase: any) {
  console.log('\n🔌 Testing Supabase connection...')

  try {
    const { error } = await supabase
      .from('studies')
      .select('count', { count: 'exact', head: true })

    if (error) {
      throw error
    }

    logSuccess('Connection to Supabase successful')
    return true
  } catch (error) {
    logError('Failed to connect to Supabase', error)
    throw error
  }
}

// Migrate studies data with PDF files
async function migrateStudies(supabase: any) {
  console.log('\n📊 Starting data migration...')

  const studiesArray = Object.values(studies)
  logInfo(`Found ${studiesArray.length} studies to migrate`)

  if (studiesArray.length === 0) {
    logWarning('No studies found to migrate')
    return
  }

  let successCount = 0
  let errorCount = 0
  let pdfUploadCount = 0

  for (let i = 0; i < studiesArray.length; i++) {
    const study = studiesArray[i]

    try {
      logInfo(`Migrating study ${i + 1}/${studiesArray.length}: "${study.title}"`)
      
      let pdfUrl = study.pdfUrl
      
      // Handle PDF upload if exists locally
      if (pdfUrl && pdfUrl.startsWith('/papers/')) {
        const localPath = path.join(process.cwd(), 'public', pdfUrl)
        
        if (fs.existsSync(localPath)) {
          logInfo(`Uploading PDF: ${pdfUrl}`)
          pdfUrl = await uploadPdfToSupabase(supabase, localPath, study.id)
          pdfUploadCount++
          logSuccess(`PDF uploaded to: ${pdfUrl}`)
        } else {
          logWarning(`PDF file not found: ${localPath}`)
        }
      }

      const { error } = await supabase.from('studies').upsert([{
        id: study.id,
        title: study.title,
        course: study.course,
        year: study.year,
        authors: study.authors,
        abstract: study.abstract,
        pdf_url: pdfUrl,
        date_published: study.datePublished,
        sections: study.sections
      }], {
        onConflict: 'id'
      })

      if (error) throw error

      logSuccess(`✓ Study "${study.title}" migrated successfully`)
      successCount++

    } catch (error) {
      logError(`✗ Failed to migrate study "${study.title}"`, error)
      errorCount++
    }
  }

  console.log('\n📈 Migration Summary:')
  logSuccess(`Successfully migrated: ${successCount} studies`)
  logSuccess(`PDF files uploaded: ${pdfUploadCount}`)
  if (errorCount > 0) {
    logError(`Failed to migrate: ${errorCount} studies`)
  }

  return { successCount, errorCount, pdfUploadCount }
}

// MAIN MIGRATION FUNCTION
async function migrate() {
  console.log('🚀 Starting migration process...')
  console.log('='.repeat(50))

  try {
    if (!checkEnvironment()) {
      process.exit(1)
    }

    const supabase = initializeSupabase()

    await testConnection(supabase)
    await ensureSchema(supabase)
    await ensureStorageBucket(supabase)
    const result = await migrateStudies(supabase)

    console.log('\n🎉 Migration completed successfully!')
    console.log('='.repeat(50))

    if (result && result.errorCount > 0) {
      logWarning(`Migration completed with ${result.errorCount} errors`)
      process.exit(1)
    }

  } catch (error) {
    console.log('\n💥 Migration failed!')
    console.log('='.repeat(50))
    logError('Migration process failed', error)

    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('connect')) {
      logError('This appears to be a connection issue. Please check:')
      console.log('   - Your internet connection')
      console.log('   - Supabase URL and credentials')
      console.log('   - Supabase project status')
    }

    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('permission')) {
      logError('This appears to be a permissions issue. Please check:')
      console.log('   - Your service role key has the correct permissions')
      console.log('   - RLS policies if enabled')
      console.log('   - Storage bucket permissions')
    }

    process.exit(1)
  }
}

// GLOBAL ERROR HANDLING
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Promise Rejection at:', promise)
  logError('Reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:', error)
  process.exit(1)
})

// ✅ START MIGRATION
migrate()