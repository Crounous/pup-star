'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter } from 'next/navigation';

export default function AddResearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    setIsLoading(true);
    
    try {
      // Handle form submission logic here
      console.log('Form submitted:', formData);
      console.log('Uploaded file:', file);
      
      // TODO: Add your API call here
      // const response = await fetch('/api/research', {
      //   method: 'POST',
      //   body: createFormData(formData, file)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect back to admin page after successful submission
      router.push('/admin');
    } catch (error) {
      console.error('Error submitting research:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          uploadedCount={8} 
          onUploadClick={() => router.push('/admin/add')}
        />
        
        {/* Main Content */}
        <div className="flex-1 bg-[#ffd600] p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">        
              <div className="text-[#850d0d]">
                <h1 className="text-xl font-normal mb-2">
                  <span className="font-bold">Welcome to the research submission portal.</span> Kindly upload your research materials using the provided interface.
                  </h1>
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