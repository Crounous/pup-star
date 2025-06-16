import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface AdminSidebarProps {
  uploadedCount?: number;
  onUploadClick?: () => void;
}

const navItems = [
  {
    label: 'Researches Uploaded',
    badge: (uploadedCount: number) => uploadedCount,
    // Navigates to /admin when clicked
    getOnClick: (_uploadedCount: number, _onUploadClick: (() => void) | undefined, router: any) => () => router.push('/admin'),
  },
  {
    label: 'Upload a Research',
    badge: (_uploadedCount: number) => '+',
    // Returns onUploadClick if it exists, otherwise undefined (none)
    getOnClick: (_uploadedCount: number, onUploadClick: (() => void) | undefined) => onUploadClick || undefined,
  },
  {
    label: 'Log Out',
    badge: (_uploadedCount: number) => '→',
    // Returns the logout function directly
    getOnClick: (_uploadedCount: number, _onUploadClick: (() => void) | undefined, router: any) => () => router.push('/'),
  },
];

export function AdminSidebar({ uploadedCount = 8, onUploadClick }: AdminSidebarProps) {
  const router = useRouter();

  return (
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
        {navItems.map((item) => {
          const onClick = item.getOnClick(uploadedCount, onUploadClick, router);
          return (
            <div
              key={item.label}
              className={`flex items-center text-[#ffd600] py-2 px-3 rounded${
                onClick ? ' cursor-pointer hover:bg-[#ffd600]/10' : ''
              }`}
              onClick={onClick}
            >
              <span className="mr-3">{item.label}</span>
              <span className="bg-[#ffd600] text-[#850d0d] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {item.badge(uploadedCount)}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}