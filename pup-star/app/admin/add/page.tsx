'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {v4 as uuidv4} from 'uuid';
import ProtectedRoute from '@/components/login/ProtectedRoute';

export default function AddResearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [uploadedCount, setUploadedCount] = useState(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('studies') // Replace with your table name
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching study count:', error);
      } else {
        setUploadedCount(count || 0);
      }
    };

    fetchCount();
  }, []);

  const handleSubmit = async (formData: ResearchFormData, file: File | null) => {
    setIsLoading(true);
    
    try {
      let fileUrl: string | undefined = undefined;

      // 1. Handle File Upload to Supabase Storage
      if (file) {
        const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`; // Create a unique file name
        const { data: fileData, error: fileError } = await supabase.storage
          .from('papers') // Your storage bucket name
          .upload(fileName, file);

        if (fileError) {
          throw new Error(`File upload failed: ${fileError.message}`);
        }
        
        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('papers') // Your storage bucket name
          .getPublicUrl(fileName);
        
        fileUrl = publicUrlData.publicUrl;
      }

      const dateObject = new Date(formData.date);;

      const newStudy = {
        // id is usually handled by Supabase (auto-increment or uuid)
        title: formData.title,
        authors: formData.authors.map(author => author.trim()),
        year: dateObject.getFullYear(),
        course: formData.course === 'computer-science' ? 'Computer Science' : 'Information Technology',
        abstract: formData.introduction, 
        date_published: dateObject.toISOString(), // Ensure date is in ISO format
        pdf_url: fileUrl, // The URL from Supabase Storage
        introduction: formData.introduction,
        methodology: formData.methodology,
        results_and_discussion: formData.resultsAndDiscussion,
        // Ensure your Supabase columns match these keys
      };

      const { error: insertError } = await supabase
        .from('studies') // Replace with your actual table name in Supabase
        .insert([newStudy]);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      alert('Research added successfully!');
      router.push('/admin');
    } catch (error: any) {
      console.error('Error submitting research:', error);
      alert(`Error adding research: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}