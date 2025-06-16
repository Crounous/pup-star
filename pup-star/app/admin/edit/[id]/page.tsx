'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter, useParams } from 'next/navigation';

export default function EditResearchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [initialData, setInitialData] = useState<ResearchFormData | null>(null);
  const [existingFileName, setExistingFileName] = useState<string>('');

  // Memoize the initial data to prevent unnecessary re-renders
  const memoizedInitialData = useMemo(() => initialData, [initialData]);

  // Fetch existing research data
  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        // TODO: Replace with your actual API call
        // const response = await fetch(`/api/research/${id}`);
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API response
        const mockData = {
          title: 'Sample Research Title',
          authors: 'John Doe, Jane Smith',
          date: '2024-01-15',
          course: 'computer-science',
          introduction: 'This is a sample introduction...',
          methodology: 'This is a sample methodology...',
          resultsAndDiscussion: 'These are sample results and discussion...',
        };
        
        setInitialData(mockData);
        setExistingFileName('sample-research.pdf');
      } catch (error) {
        console.error('Error fetching research data:', error);
        // Handle error (show toast, redirect, etc.)
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) {
      fetchResearchData();
    }
  }, [id]);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    setIsLoading(true);
    
    try {
      // Handle form submission logic here
      console.log('Updated form data:', formData);
      console.log('New uploaded file:', file);
      
      // TODO: Add your API call here
      // const response = await fetch(`/api/research/${id}`, {
      //   method: 'PUT',
      //   body: createFormData(formData, file)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect back to admin page after successful update
      router.push('/admin');
    } catch (error) {
      console.error('Error updating research:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Add your delete API call here
      // const response = await fetch(`/api/research/${id}`, {
      //   method: 'DELETE'
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to admin page after successful deletion
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting research:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
        <div className="flex">
          <AdminSidebar 
            uploadedCount={8} 
            onUploadClick={() => router.push('/admin/add')}
          />
          <div className="flex-1 bg-[#ffd600] p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#850d0d] border-t-transparent"></div>
                <span className="ml-4 text-[#850d0d] text-lg">Loading research data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold mb-2">
                  Edit Research Paper
                </h1>
                <p className="text-[#850d0d]">
                  Update your research materials using the form below.
                </p>
              </div>
            </div>

            {/* Research Form */}
            <ResearchForm
              initialData={memoizedInitialData || {}}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              isEditMode={true}
              isLoading={isLoading}
              existingFileName={existingFileName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}