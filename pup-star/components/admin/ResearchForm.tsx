'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Trash2, Save, PlusCircle, XCircle } from 'lucide-react';

export interface ResearchFormData {
  title: string;
  authors: string[];
  date: string;
  course: string;
  introduction: string;
  methodology: string;
  resultsAndDiscussion: string;
}

export interface ResearchFormProps {
  initialData?: Partial<ResearchFormData>;
  onSubmit: (data: ResearchFormData, file: File | null) => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
  existingFileName?: string;
}

const defaultFormData: ResearchFormData = {
  title: '',
  authors: [''],
  date: '',
  course: '',
  introduction: '',
  methodology: '',
  resultsAndDiscussion: '',
};

export function ResearchForm({
  initialData = {},
  onSubmit,
  onDelete,
  isEditMode = false,
  isLoading = false,
  existingFileName
}: ResearchFormProps) {
  const [formData, setFormData] = useState<ResearchFormData>({
    ...defaultFormData,
    ...initialData
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const hasInitialized = useRef(false);

  // Update form data when initialData changes (useful for edit mode)
  useEffect(() => {
  // Only update if we haven't initialized yet and initialData has actual content
  if (!hasInitialized.current && initialData && Object.keys(initialData).length > 0) {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      // Ensure authors is always an array. If initialData.authors is not provided, fallback to an array with one empty string.
      authors: initialData.authors && initialData.authors.length > 0 ? initialData.authors : [''],
    }));
    hasInitialized.current = true;
  }
}, [initialData]);

const handleInputChange = (field: keyof ResearchFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData(prev => ({
      ...prev,
      authors: newAuthors
    }));
  };

  const addAuthorField = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, '']
    }));
  };

  const removeAuthorField = (index: number) => {
    if (formData.authors.length > 1) {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        authors: newAuthors
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Keep formData as is, without transforming the authors array
  onSubmit(formData, uploadedFile);
};

  const handleDelete = () => {
    if (onDelete) {
      // You might want to show a confirmation dialog here
      const confirmed = window.confirm('Are you sure you want to delete this research?');
      if (confirmed) {
        onDelete();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-[#850d0d] font-bold text-lg block">
          Title*
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="bg-transparent border-[#850d0d] text-[#850d0d] border-2 rounded-lg h-12 text-lg"
          required
          disabled={isLoading}
        />
      </div>

      {/* Authors */}
      <div>
  <Label className="text-[#850d0d] font-bold text-lg block mb-2">
    Author/s*
  </Label>
  <div className="flex flex-wrap items-center gap-2">
    {formData.authors.map((author, index) => (
      <div key={index} className="relative flex-grow sm:flex-grow-0">
        <Input
          id={`author-${index}`}
          value={author}
          onChange={(e) => handleAuthorChange(index, e.target.value)}
          className="border-[#850d0d] border-2 rounded-lg h-12 text-lg w-65 text-[#850d0d]"
          required
          disabled={isLoading}
        />
        {/* The remove button is only shown if there is more than one author */}
        {formData.authors.length > 1 && (
          <div className="absolute inset-y-0 right-0 flex items-center">
             <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAuthorField(index)}
                className="text-black-400 hover:text-red-700 hover:bg-transparent"
                disabled={isLoading}
             >
                <XCircle className="h-10 w-10" />
            </Button>
          </div>
        )}
      </div>
    ))}
    
    <Button
      type="button"
      variant="outline"
      onClick={addAuthorField}
      className="text-white border-[#850d0d] rounded-full border-2 bg-[#850d0d] hover:bg-[#621010] hover:text-white"
      disabled={isLoading}
    >
      <PlusCircle className="h-4 w-4" />
    </Button>
  </div>
</div>

      {/* Date and Course Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date */}
        <div>
          <Label htmlFor="date" className="text-[#850d0d] font-bold text-lg block">
            Date*
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="border-[#850d0d] border-2 rounded-lg h-12 text-lg focus:ring-2 focus:ring-[#850d0d] text-[#850d0d]"
            required
            disabled={isLoading}
          />
        </div>

        {/* Course */}
        <div>
          <Label className="text-[#850d0d] font-bold text-lg block">
            Course*
          </Label>
          <RadioGroup
            value={formData.course}
            onValueChange={(value) => handleInputChange('course', value)}
            className="flex flex-col"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2" 
                style={{ marginBottom: '-1rem' }}>
              <RadioGroupItem 
                value="computer-science" 
                id="cs" 
                className="border-[#850d0d] text-[#850d0d] data-[state=checked]:bg-[#850d0d]" 
                disabled={isLoading}
              />
              <Label htmlFor="cs" className="text-[#850d0d] text-lg">Computer Science</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="information-technology" 
                id="it" 
                className="border-[#850d0d] text-[#850d0d] data-[state=checked]:bg-[#850d0d]" 
                disabled={isLoading}
              />
              <Label htmlFor="it" className="text-[#850d0d] text-lg">Information Technology</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Thesis PDF Upload */}
      <div>
        <Label className="text-[#850d0d] font-bold text-lg  block">
          Thesis PDF{!isEditMode && '*'}
        </Label>
        <Card className="border-[#850d0d] border-2 bg-transparent">
          <CardContent className="p-8">
            <div className="text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="pdf-upload"
                className={`cursor-pointer flex flex-col items-center space-y-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className=" p-4 rounded-full bg-[#cc8400]">
                  <Upload className="h-8 w-8 text-[#850d0d]" />
                </div>
                <div className="text-[#850d0d]">
                  <p className="font-medium text-lg">
                    {isEditMode ? 'Upload New PDF (Optional)' : 'Upload Thesis Paper Here'}
                  </p>
                  {uploadedFile && (
                    <p className="text-sm mt-2 flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      {uploadedFile.name}
                    </p>
                  )}
                  {isEditMode && existingFileName && !uploadedFile && (
                    <p className="text-sm mt-2 flex items-center justify-center gap-2 text-[#850d0d]/70">
                      <FileText className="h-4 w-4" />
                      Current: {existingFileName}
                    </p>
                  )}
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Introduction */}
      <div>
        <Label htmlFor="introduction" className="text-[#850d0d] font-bold text-lg block">
          Introduction*
        </Label>
        <Textarea
          id="introduction"
          value={formData.introduction}
          onChange={(e) => handleInputChange('introduction', e.target.value)}
          className="border-[#850d0d] border-2 rounded-lg text-lg text-[#850d0d] min-h-[150px] resize-none focus:ring-2 focus:ring-[#850d0d]"
          required
          disabled={isLoading}
        />
      </div>

      {/* Methodology */}
      <div>
        <Label htmlFor="methodology" className="text-[#850d0d] font-bold text-lg block">
          Methodology
        </Label>
        <Textarea
          id="methodology"
          value={formData.methodology}
          onChange={(e) => handleInputChange('methodology', e.target.value)}
          className="border-[#850d0d] border-2 rounded-lg text-lg text-[#850d0d] min-h-[150px] resize-none focus:ring-2 focus:ring-[#850d0d]"
          disabled={isLoading}
        />
      </div>

      {/* Results and Discussion */}
      <div>
        <Label htmlFor="results" className="text-[#850d0d] font-bold text-lg block">
          Results and Discussion
        </Label>
        <Textarea
          id="results"
          value={formData.resultsAndDiscussion}
          onChange={(e) => handleInputChange('resultsAndDiscussion', e.target.value)}
          className="border-[#850d0d] border-2 rounded-lg text-lg text-[#850d0d] min-h-[150px] resize-none focus:ring-2 focus:ring-[#850d0d]"
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6">
        {isEditMode && onDelete && (
          <Button
            type="button"
            onClick={handleDelete}
            variant="outline"
            className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-lg"
            disabled={isLoading}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[#850d0d] hover:bg-[#6b0a0a] text-[#ffd600] px-8 py-3 text-lg font-semibold rounded-lg border-2 border-[#850d0d]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#ffd600] border-t-transparent mr-2" />
              {isEditMode ? 'Updating...' : 'Uploading...'}
            </>
          ) : (
            <>
              {isEditMode ? <Save className="h-5 w-5 mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
              {isEditMode ? 'Update' : 'Upload'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}