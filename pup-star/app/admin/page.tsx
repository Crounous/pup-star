'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Filter, Menu, Edit, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResearchDeletionPopup } from '@/components/admin/ResearchDeletionPopup';
import { EditResearchModal } from '@/components/admin/EditResearchModal';
import { ResearchFormData } from '@/components/admin/ResearchForm';
import { studies as initialStudies } from '../data/studies';
import { Study } from '../types/study';

const ITEMS_PER_PAGE = 4;

export default function AdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [tempSelectedCourses, setTempSelectedCourses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [tempSortBy, setTempSortBy] = useState(sortBy);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [deletionPopupOpen, setDeletionPopupOpen] = useState(false);
  const [researchToDelete, setResearchToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studies, setStudies] = useState(initialStudies);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize tempSelectedCourses when component mounts
  useEffect(() => {
    setTempSelectedCourses(selectedCourses);
  }, []);

  // Convert studies object to array
  const allStudies: Study[] = Object.values(studies);

  const courses = ['Computer Science', 'Information Technology'];

  const handleCourseChange = (course: string, checked: boolean) => {
    if (checked) {
      setTempSelectedCourses([...tempSelectedCourses, course]);
    } else {
      setTempSelectedCourses(tempSelectedCourses.filter(c => c !== course));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleFilterApply = () => {
    setSelectedCourses(tempSelectedCourses);
    setCurrentPage(1); // Reset to first page when filters change
    setIsFilterOpen(false);
  };

  const handleSortApply = () => {
    setSortBy(tempSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
    setIsSortOpen(false);
  };

  // Filter studies based on search and course filters
  const filteredStudies = allStudies.filter(study => {
    const matchesCourse = selectedCourses.length === 0 || selectedCourses.includes(study.course);
    const matchesSearch = searchQuery
      ? study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCourse && matchesSearch;
  });

  // Sort studies
  const sortedStudies = [...filteredStudies].sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    } else {
      return b.year - a.year;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedStudies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudies = sortedStudies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!researchToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/research/${researchToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete research');
      }

      // Update the studies state by removing the deleted study
      setStudies(prevStudies => {
        const newStudies = { ...prevStudies };
        delete newStudies[researchToDelete];
        return newStudies;
      });

      // Close the popup and reset state
      setDeletionPopupOpen(false);
      setResearchToDelete(null);

      // Reset to first page if current page becomes empty
      if (paginatedStudies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (study: Study) => {
    setEditingStudy(study);
  };

  const handleUpdate = async (formData: ResearchFormData, file: File | null) => {
    if (!editingStudy) return;
    
    setIsUpdating(true);
    
    try {
      // Format the date for display
      const date = new Date(formData.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const formattedDate = `${month}, ${year}`;

      // Create updated study object
      const updatedStudy: Study = {
        ...editingStudy,
        title: formData.title,
        authors: formData.authors.map(author => author.trim()),
        year: date.getFullYear(),
        course: formData.course === 'computer-science' ? 'Computer Science' : 'Information Technology',
        abstract: formData.introduction,
        datePublished: formattedDate,
        pdfUrl: file ? `/papers/${file.name}` : editingStudy.pdfUrl,
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
      const response = await fetch(`/api/research/${editingStudy.id}`, {
        method: 'PUT',
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Failed to update research');
      }

      // Update the studies state
      setStudies(prevStudies => ({
        ...prevStudies,
        [editingStudy.id]: updatedStudy
      }));

      // Show success message and close modal
      alert('Research updated successfully!');
      setEditingStudy(null);
    } catch (error) {
      console.error('Error updating research:', error);
      alert('Error updating research. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4;
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push('...');
      }

      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          uploadedCount={allStudies.length} 
          onUploadClick={() => router.push('/admin/add')}
        />
        {/* Main Content */}
        <div className="flex-1 bg-[#ffd600] p-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              {/* Filter Dialog */}
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full px-6 py-2">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#ffd600] border-2 border-[#850d0d] rounded-xl">
                  <DialogTitle className="text-[#850d0d] font-bold text-lg mb-4">Course</DialogTitle>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course} className="flex items-center space-x-2">
                        <Checkbox
                          id={course}
                          checked={tempSelectedCourses.includes(course)}
                          onCheckedChange={(checked) => handleCourseChange(course, checked as boolean)}
                          className="border-[#850d0d] data-[state=checked]:bg-[#850d0d]"
                        />
                        <Label htmlFor={course} className="text-[#850d0d] font-medium">
                          {course}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleFilterApply}
                    className="w-full bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] mt-6"
                  >
                    Apply Filter
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Sort Dialog */}
              <Dialog open={isSortOpen} onOpenChange={setIsSortOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full px-6 py-2">
                    <Menu className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#ffd600] border-2 border-[#850d0d] rounded-xl">
                  <DialogTitle className="text-[#850d0d] font-bold text-lg mb-4">Sort By</DialogTitle>
                  <RadioGroup value={tempSortBy} onValueChange={setTempSortBy}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="name" 
                        id="name"
                        className="border-[#850d0d] text-[#850d0d]"
                      />
                      <Label htmlFor="name" className="text-[#850d0d] font-medium">
                        Sort By Name
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="date" 
                        id="date"
                        className="border-[#850d0d] text-[#850d0d]"
                      />
                      <Label htmlFor="date" className="text-[#850d0d] font-medium">
                        Sort By Date
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button
                    onClick={handleSortApply}
                    className="w-full bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] mt-6"
                  >
                    Apply Sort
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#850d0d] w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-2 border-[#850d0d] rounded-full text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d]"
                />
              </div>
            </form>
          </div>

          {/* Table Header */}
          <div className="bg-[#ffd600] border-b-2 border-[#850d0d] pb-4 mb-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <h2 className="text-[#850d0d] font-bold text-lg">TITLE</h2>
              </div>
              <div className="col-span-2">
                <h2 className="text-[#850d0d] font-bold text-lg">YEAR OF PUBLICATION</h2>
              </div>
              <div className="col-span-2"></div>
            </div>
          </div>

          {/* Research List */}
          <div className="space-y-4">
            {paginatedStudies.map((study) => (
              <div key={study.id} className="rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#850d0d] mb-2">{study.title}</h3>
                    <p className="text-[#850d0d] mb-1">
                      <span className="font-semibold">Authors:</span> {study.authors.join(', ')}
                    </p>
                    <p className="text-[#850d0d] mb-1">
                      <span className="font-semibold">Course:</span> {study.course}
                    </p>
                    <p className="text-[#850d0d]">
                      <span className="font-semibold">Year:</span> {study.year}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(study)}
                      className="px-3 py-1 text-[#850d0d]"
                    >
                     <Edit className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => {
                        setResearchToDelete(study.id);
                        setDeletionPopupOpen(true);
                      }}
                      className="px-3 py-1 text-[#850d0d] "
                    >
                     <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <p className="text-[#850d0d]">{study.abstract}</p>
              </div>
            ))}
          </div>

          <ResearchDeletionPopup
            open={deletionPopupOpen}
            onConfirm={handleDelete}
            onCancel={() => {
              setDeletionPopupOpen(false);
              setResearchToDelete(null);
            }}
            isDeleting={isDeleting}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 space-x-2">
              <Button
                variant="ghost"
                className="text-[#850d0d] hover:bg-[#850d0d]/10"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="text-[#850d0d]">...</span>
                ) : (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`w-8 h-8 rounded ${
                      currentPage === pageNum
                        ? 'bg-[#850d0d] text-[#ffd600]'
                        : 'text-[#850d0d] hover:bg-[#850d0d]/10'
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              ))}

              <Button
                variant="ghost"
                className="text-[#850d0d] hover:bg-[#850d0d]/10"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudy && (
        <EditResearchModal
          study={editingStudy}
          onClose={() => setEditingStudy(null)}
          onUpdate={handleUpdate}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}