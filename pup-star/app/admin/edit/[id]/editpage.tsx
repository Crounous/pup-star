'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter } from 'next/navigation';
import { studies } from '@/app/data/studies';
import { Study } from '@/app/types/study';

export default function EditResearchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoadingStudy, setIsLoadingStudy] = useState(true);

  useEffect(() => {
    // Find the study in the studies object
    const foundStudy = studies[params.id];
    if (foundStudy) {
      setStudy(foundStudy);
    } else {
      alert('Study not found');
      router.push('/admin');
    }
    setIsLoadingStudy(false);
  }, [params.id, router]);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    if (!study) return;
    
    setIsLoading(true);
    
    try {
      // Format the date for display
      const date = new Date(formData.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const formattedDate = `${month}, ${year}`;

      // Create updated study object
      const updatedStudy: Study = {
        ...study,
        title: formData.title,
        authors: formData.authors.map(author => author.trim()),
        year: date.getFullYear(),
        course: formData.course === 'computer-science' ? 'Computer Science' : 'Information Technology',
        abstract: formData.introduction,
        datePublished: formattedDate,
        pdfUrl: file ? `/papers/${file.name}` : study.pdfUrl,
        sections: {
          introduction: formData.introduction,
          methodology: formData.methodology,
          results: formData.resultsAndDiscussion
        }
      };

      // Create FormData for the API request
      const apiFormData = new FormData();
      apiFormData.append('studyData', JSON.stringify(updatedStudy));
      if (file) {
        apiFormData.append('file', file);
      }

      // Send the request to our API
      const response = await fetch(`/api/research/${study.id}`, {
        method: 'PUT',
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Failed to update research');
      }

      // Show success message and redirect
      alert('Research updated successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error updating research:', error);
      alert('Error updating research. Please try again.');
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
    introduction: study.sections?.introduction || study.abstract,
    methodology: study.sections?.methodology || '',
    resultsAndDiscussion: study.sections?.results || ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          uploadedCount={Object.keys(studies).length} 
          onUploadClick={() => router.push('/admin/add')}
        />
        
        {/* Main Content */}
        <div className="flex-1 bg-[#ffd600] p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">        
              <div className="text-[#850d0d]">
                <h1 className="text-xl font-semibold mb-2">
                  Edit Research
                </h1>
                <p className="text-[#850d0d]">
                  Update the research information using the form below.
                </p>
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