'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter } from 'next/navigation';
import { studies } from '@/app/data/studies';
import { Study } from '@/app/types/study';

export default function AddResearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    setIsLoading(true);
    
    try {
      // Create a new study object
      const newStudy: Study = {
        id: `study-${Object.keys(studies).length + 1}`, // Generate a new ID
        title: formData.title,
        authors: formData.authors.split(',').map(author => author.trim()),
        year: new Date(formData.date).getFullYear(),
        course: formData.course === 'computer-science' ? 'Computer Science' : 'Information Technology',
        abstract: formData.introduction, // Using introduction as abstract
        pdfUrl: file ? `/papers/${file.name}` : undefined,
        sections: {
          introduction: formData.introduction,
          methodology: formData.methodology,
          results: formData.resultsAndDiscussion
        }
      };

      // Create FormData for the API request
      const apiFormData = new FormData();
      apiFormData.append('studyData', JSON.stringify(newStudy));
      if (file) {
        apiFormData.append('file', file);
      }

      // Send the request to our API
      const response = await fetch('/api/research', {
        method: 'POST',
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Failed to submit research');
      }

      // Show success message and redirect
      alert('Research added successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error submitting research:', error);
      alert('Error adding research. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                  Welcome to the research submission portal.
                </h1>
                <p className="text-[#850d0d]">
                  Kindly upload your research materials using the provided interface.
                </p>
              </div>
            </div>

            {/* Research Form */}
            <ResearchForm
              onSubmit={handleSubmit}
              isEditMode={false}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}