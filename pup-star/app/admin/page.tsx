'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Filter, Menu, Edit, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for research papers
const mockResearches = [
  {
    id: 1,
    title: "XAVIER: eXplainable AI with LIME and Grad-CAM for Visual Interpretation and Efficient Fungi Skin Disease Recognition using EfficientNet",
    year: "2019",
    course: "Computer Science"
  },
  {
    id: 2,
    title: "Mahabang title sa research paper na prof ay si maam she buban usero na mabangis",
    year: "2019",
    course: "Information Technology"
  },
  {
    id: 3,
    title: "Beyond the Itch: CNN-Based Multiclass Classification of Seven Eczema Subtypes Across Diverse Skin Types",
    year: "2019",
    course: "Computer Science"
  },
  {
    id: 4,
    title: "XAVIER: eXplainable AI with LIME and Grad-CAM for Visual Interpretation and Efficient Fungi Skin Disease Recognition using EfficientNet",
    year: "2019",
    course: "Information Technology"
  },
  {
    id: 5,
    title: "XAVIER: eXplainable AI with LIME and Grad-CAM for Visual Interpretation and Efficient Fungi Skin Disease Recognition using EfficientNet",
    year: "2019",
    course: "Computer Science"
  },
  {
    id: 6,
    title: "Mahabang title sa research paper na prof ay si maam she buban usero na mabangis",
    year: "2019",
    course: "Information Technology"
  },
  {
    id: 7,
    title: "Beyond the Itch: CNN-Based Multiclass Classification of Seven Eczema Subtypes Across Diverse Skin Types",
    year: "2019",
    course: "Computer Science"
  },
  {
    id: 8,
    title: "XAVIER: eXplainable AI with LIME and Grad-CAM for Visual Interpretation and Efficient Fungi Skin Disease Recognition using EfficientNet",
    year: "2019",
    course: "Information Technology"
  }
];

export default function AdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const courses = ['Computer Science', 'Information Technology'];

  const handleCourseChange = (course: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, course]);
    } else {
      setSelectedCourses(selectedCourses.filter(c => c !== course));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#850d0d] to-[#ffd600] font-montserrat">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#850d0d] min-h-screen p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#ffd600] tracking-wider">
              PUP ST
              <Star className="inline-block w-6 h-6 mx-1 fill-[#ffd600] text-[#ffd600]" />
              R
            </h1>
            <p className="text-[#ffd600] text-sm font-semibold">ADMIN</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-4">
            <div className="flex items-center text-[#ffd600] py-2 px-3 rounded">
              <span className="mr-3">Researches Uploaded</span>
              <span className="bg-[#ffd600] text-[#850d0d] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                8
              </span>
            </div>
            <div className="flex items-center text-[#ffd600] py-2 px-3 rounded">
              <span className="mr-3">Upload a Research</span>
              <span className="bg-[#ffd600] text-[#850d0d] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                +
              </span>
            </div>
            <div
              className="flex items-center text-[#ffd600] py-2 px-3 rounded cursor-pointer hover:bg-[#ffd600]/10"
              onClick={() => router.push('/')}
            >
              <span className="mr-3">Log Out</span>
              <span className="bg-[#ffd600] text-[#850d0d] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                →
              </span>
            </div>
          </nav>
        </div>

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
                          checked={selectedCourses.includes(course)}
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
                    onClick={() => setIsFilterOpen(false)}
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
                  <RadioGroup value={sortBy} onValueChange={setSortBy}>
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
                    onClick={() => setIsSortOpen(false)}
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
            {mockResearches.map((research) => (
              <div key={research.id} className="grid grid-cols-12 gap-4 py-4 border-b border-[#850d0d]/20">
                <div className="col-span-8">
                  <h3 className="text-[#850d0d] font-medium leading-relaxed">
                    {research.title}
                  </h3>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-[#850d0d] font-bold text-lg">
                    {research.year}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end space-x-2">
                  <Button
                    size="icon"
                    className="bg-transparent hover:bg-[#850d0d]/10 text-[#850d0d] w-8 h-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-transparent hover:bg-[#850d0d]/10 text-[#850d0d] w-8 h-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <Button
              variant="ghost"
              className="text-[#850d0d] hover:bg-[#850d0d]/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button className="bg-[#850d0d] text-[#ffd600] w-8 h-8 rounded">
              1
            </Button>
            <Button
              variant="ghost"
              className="text-[#850d0d] hover:bg-[#850d0d]/10 w-8 h-8"
            >
              2
            </Button>
            <Button
              variant="ghost"
              className="text-[#850d0d] hover:bg-[#850d0d]/10 w-8 h-8"
            >
              3
            </Button>
            <span className="text-[#850d0d]">...</span>
            <Button
              variant="ghost"
              className="text-[#850d0d] hover:bg-[#850d0d]/10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}