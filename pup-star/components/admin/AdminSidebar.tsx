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
    getOnClick: (_uploadedCount: number, _onUploadClick: (() => void) | undefined, router: any) => () => router.push('/admin'),
  },
  {
    label: 'Upload a Research',
    badge: (_uploadedCount: number) => (
      <img src="../adminpage/UploadResearchButton.png" alt="PUP STAR" className="w-6 h-auto" />
    ),
    getOnClick: (_uploadedCount: number, onUploadClick: (() => void) | undefined) => onUploadClick || undefined,
  },
  {
    label: 'Log Out',
    badge: (_uploadedCount: number) => (
      <img src="../adminpage/LogoutButton.png" alt="PUP STAR" className="w-6 h-auto" />
    ),
    // Updated logout function to clear token
    getOnClick: (_uploadedCount: number, _onUploadClick: (() => void) | undefined, router: any) => () => {
      localStorage.removeItem('adminToken');  // Clear authentication token
      router.push('/');  // Redirect to home
    },
  },
];

export function AdminSidebar({ uploadedCount = 8, onUploadClick }: AdminSidebarProps) {
  const router = useRouter();

  return (
    <div className="w-75 bg-[#850d0d] min-h-screen p-6">
      {/* Logo */}
      <div className="mb-8">
        <img src="../PUPStarLogoYellow.png" alt="PUP STAR" className="w-75 h-auto "/>
        <p className="text-[#ffd600] text-lg font-semibold text-center" style={{ margin: '-0.5rem 0' }}>ADMIN </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-4">
        {navItems.map((item) => {
          const onClick = item.getOnClick(uploadedCount, onUploadClick, router);
          return (
            <div
              key={item.label}
              className={`flex items-center justify-end text-[#ffd600] rounded${
                onClick ? ' cursor-pointer' : ''
              }`}
              onClick={onClick}
            >
              <span className="mr-3">{item.label}</span>
              <span className="bg-[#ffd600] text-[#850d0d] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {item.badge(uploadedCount)}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}