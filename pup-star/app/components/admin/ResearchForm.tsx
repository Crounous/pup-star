import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

export interface ResearchFormData {
  title: string;
  authors: string;
  date: string;
  course: 'computer-science' | 'information-technology';
  introduction: string;
  methodology: string;
  resultsAndDiscussion: string;
}

interface ResearchFormProps {
  onSubmit: (data: ResearchFormData, file: File | null) => Promise<void>;
  isEditMode?: boolean;
  isLoading?: boolean;
  initialData?: ResearchFormData;
}

export function ResearchForm({ onSubmit, isEditMode = false, isLoading = false, initialData }: ResearchFormProps) {
  const [formData, setFormData] = useState<ResearchFormData>(initialData || {
    title: '',
    authors: '',
    date: '',
    course: 'computer-science',
    introduction: '',
    methodology: '',
    resultsAndDiscussion: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-[#850d0d] font-semibold">
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d]"
          required
        />
      </div>

      {/* Authors */}
      <div>
        <Label htmlFor="authors" className="text-[#850d0d] font-semibold">
          Authors (comma-separated)
        </Label>
        <Input
          id="authors"
          value={formData.authors}
          onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d]"
          required
        />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date" className="text-[#850d0d] font-semibold">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d]"
          required
        />
      </div>

      {/* Course */}
      <div>
        <Label className="text-[#850d0d] font-semibold block mb-2">
          Course
        </Label>
        <RadioGroup
          value={formData.course}
          onValueChange={(value) => setFormData({ ...formData, course: value as 'computer-science' | 'information-technology' })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="computer-science"
              id="computer-science"
              className="border-[#850d0d] text-[#850d0d]"
            />
            <Label htmlFor="computer-science" className="text-[#850d0d]">
              Computer Science
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="information-technology"
              id="information-technology"
              className="border-[#850d0d] text-[#850d0d]"
            />
            <Label htmlFor="information-technology" className="text-[#850d0d]">
              Information Technology
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Introduction */}
      <div>
        <Label htmlFor="introduction" className="text-[#850d0d] font-semibold">
          Introduction
        </Label>
        <Textarea
          id="introduction"
          value={formData.introduction}
          onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d] min-h-[100px]"
          required
        />
      </div>

      {/* Methodology */}
      <div>
        <Label htmlFor="methodology" className="text-[#850d0d] font-semibold">
          Methodology
        </Label>
        <Textarea
          id="methodology"
          value={formData.methodology}
          onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d] min-h-[100px]"
          required
        />
      </div>

      {/* Results and Discussion */}
      <div>
        <Label htmlFor="resultsAndDiscussion" className="text-[#850d0d] font-semibold">
          Results and Discussion
        </Label>
        <Textarea
          id="resultsAndDiscussion"
          value={formData.resultsAndDiscussion}
          onChange={(e) => setFormData({ ...formData, resultsAndDiscussion: e.target.value })}
          className="mt-1 bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d] min-h-[100px]"
          required
        />
      </div>

      {/* PDF Upload */}
      <div>
        <Label htmlFor="pdf" className="text-[#850d0d] font-semibold">
          PDF File
        </Label>
        <div className="mt-1 flex items-center gap-4">
          <Input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="bg-white border-2 border-[#850d0d] text-[#850d0d] focus:ring-2 focus:ring-[#850d0d]"
          />
          {fileName && (
            <span className="text-[#850d0d]">{fileName}</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a]"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : isEditMode ? 'Update Research' : 'Add Research'}
      </Button>
    </form>
  );
} 