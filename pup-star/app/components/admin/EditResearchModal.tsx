import React from 'react';
import { ResearchForm, ResearchFormData } from '@/components/admin/ResearchForm';
import { Study } from '@/app/types/study';
import { X } from 'lucide-react';

interface EditResearchModalProps {
  study: Study;
  onClose: () => void;
  onUpdate: (formData: ResearchFormData, file: File | null) => Promise<void>;
  isLoading: boolean;
}

export function EditResearchModal({ study, onClose, onUpdate, isLoading }: EditResearchModalProps) {
  // Convert the study data to form data
  const initialFormData: ResearchFormData = {
    title: study.title,
    authors: study.authors.join(', '),
    date: new Date(study.year, 0, 1).toISOString().split('T')[0], // Convert year to date
    course: study.course === 'Computer Science' ? 'computer-science' : 'information-technology',
    introduction: study.sections?.introduction || study.abstract,
    methodology: study.sections?.methodology || '',
    resultsAndDiscussion: study.sections?.results || ''
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#ffd600] rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#ffd600] p-6 border-b border-[#850d0d]/20 flex justify-between items-center">
          <div className="text-[#850d0d]">
            <h2 className="text-xl font-semibold mb-2">
              Edit Research
            </h2>
            <p className="text-[#850d0d]">
              Update the research information using the form below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#850d0d] hover:text-[#850d0d]/80 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <ResearchForm
            onSubmit={onUpdate}
            isEditMode={true}
            isLoading={isLoading}
            initialData={initialFormData}
          />
        </div>
      </div>
    </div>
  );
} 