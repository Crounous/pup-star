'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface Study {
  id: number;
  title: string;
  authors: string[];
  year: number;
  course: string;
  abstract: string;
  date_published: string;
  pdf_url?: string;
  introduction: string;
  methodology: string;
  results_and_discussion: string;
}

export default function EditResearchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoadingStudy, setIsLoadingStudy] = useState(true);
  const [uploadedCount, setUploadedCount] = useState(0);
  
  useEffect(() => {
    const fetchStudy = async () => {
      setIsLoadingStudy(true);
      // Fetch the specific study from Supabase
      const { data, error } = await supabase
        .from('studies') // Your table name
        .select('*')
        .eq('id', params.id) // Filter by the ID from the URL
        .single(); // Expect only one result

      if (error || !data) {
        console.error('Error fetching study:', error);
        alert('Study not found or failed to load.');
        router.push('/admin');
      } else {
        setStudy(data as Study);
      }
      setIsLoadingStudy(false);
    };

    // Also fetch the total count for the sidebar
    const fetchCount = async () => {
      const { count } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true });
      setUploadedCount(count || 0);
    };

    if (params.id) {
      fetchStudy();
      fetchCount();
    }
  }, [params.id, router]);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    if (!study) return;
    
    setIsLoading(true);
    
    try {
     let updatedPdfUrl = study.pdf_url;
     if (file) {
        const fileName = `${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('research-papers') // Your storage bucket
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Failed to upload new file: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('research-papers')
          .getPublicUrl(fileName);

        updatedPdfUrl = publicUrlData.publicUrl;

      if (study.pdf_url) {
          const oldFileName = study.pdf_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('research-papers').remove([oldFileName]);
          }
        }
      }

      const date = new Date(formData.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const formattedDate = `${month}, ${year}`;

      const updatedStudyData = {
        title: formData.title,
        authors: formData.authors.map(author => author.trim()),
        year: date.getFullYear(),
        course: formData.course === 'computer-science' ? 'Computer Science' : 'Information Technology',
        abstract: formData.introduction,
        date_published: formattedDate,
        pdf_url: updatedPdfUrl,
        introduction: formData.introduction,
        methodology: formData.methodology,
        results_and_discussion: formData.resultsAndDiscussion,
      };

      const { error: updateError } = await supabase
        .from('studies') // Your table name
        .update(updatedStudyData)
        .eq('id', params.id); // Specify which row to update

      if (updateError) {
        throw new Error(`Failed to update research: ${updateError.message}`);
      }

      alert('Research updated successfully!');
      router.push('/admin');
    } catch (error: any) {
      console.error('Error updating research:', error);
      alert(`Error updating research: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

 if (isLoadingStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat flex items-center justify-center">
        <div className="text-[#850d0d] text-xl">Loading...</div>
      </div>
    );
  }

  if (!study) {
    return null;
  }

  // Convert the study data to form data
  const initialFormData: Partial<ResearchFormData> = {
    title: study.title,
    authors: study.authors,
    date: new Date(study.year, 0, 1).toISOString().split('T')[0], // Convert year to date
    course: study.course === 'Computer Science' ? 'computer-science' : 'information-technology',
    introduction: study.introduction || study.abstract,
    methodology: study.methodology || '',
    resultsAndDiscussion: study.results_and_discussion || ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          uploadedCount={uploadedCount} 
          onUploadClick={() => router.push('/admin/add')}
        />
        
        {/* Main Content */}
        <div className="flex-1 bg-[#ffd600] p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-[#850d0d]">
                <h1 className="text-xl font-semibold mb-2">Edit Research</h1>
                <p className="text-[#850d0d]">Update the research information using the form below.</p>
              </div>
            </div>

            {/* Research Form */}
            <ResearchForm
              onSubmit={handleSubmit}
              isEditMode={true}
              isLoading={isLoading}
              initialData={initialFormData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}