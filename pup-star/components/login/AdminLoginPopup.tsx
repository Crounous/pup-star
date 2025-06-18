'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface AdminLoginPopupProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AdminLoginPopup({ 
  trigger, 
  isOpen: controlledOpen, 
  onOpenChange 
}: AdminLoginPopupProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'forgot'>('login');

  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'password123',
  });
  
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password form states
  const [securityCode, setSecurityCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === credentials.username && password === credentials.password) {
    setIsOpen(false);
    setUsername('');
    setPassword('');
    router.push('/admin');
  } else {
    alert('Invalid username or password');
  }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset attempted with:', { securityCode, newPassword, confirmPassword });
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setCredentials(currentCredentials => ({
    ...currentCredentials,
    password: newPassword,
  }));
  
  alert('Password has been successfully reset for this session.');
                   
    // Handle forgot password logic here
    setIsOpen(false);
    
    // Reset form and view
    setSecurityCode('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentView('login');
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to login view when dialog closes
      setCurrentView('login');
      // Reset all form fields
      setUsername('');
      setPassword('');
      setSecurityCode('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const defaultTrigger = (
    <Button className="bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] px-6 py-3 text-lg font-semibold">
      Staff Login
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-[#ffd600] border-none p-0 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">
          {currentView === 'login' ? 'PUP STAR Admin Login' : 'PUP STAR Password Reset'}
        </DialogTitle>
        
        <div className="bg-[#ffd600] rounded-3xl p-8 w-full">
          {/* Header */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center mb-0">
              <img src="../PUPStarLogoRed.png" alt="PUP STAR Logo" className="w-auto h-14" style={{ margin: '-0.5rem' }}/>
            </div>
            <p className="text-[#850d0d] text-md font-semibold tracking-wider">
              ADMIN LOGIN
            </p>
          </div>

          {currentView === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#850d0d] font-bold text-base">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="User or Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#850d0d] font-bold text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* Login Button */}
              <div className="flex justify-center">
              <Button
                type="submit"
                className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-5 text-lg font-bold mt-0 transition-colors duration-200"
              >
                Login
              </Button>
              </div>
              {/* Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="text-[#850d0d] text-sm hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Security Code */}
              <div className="space-y-2">
                <Label htmlFor="securityCode" className="text-[#850d0d] font-bold text-base">
                  Security Code
                </Label>
                <Input
                  id="securityCode"
                  type="text"
                  placeholder="User or Name"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[#850d0d] font-bold text-base">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#850d0d] font-bold text-base">
                  New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* Reset Password Button */}
              <div className="flex justify-center">
              <Button
                type="submit"
                className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-4 text-lg font-bold mt-4 transition-colors duration-200"
              >
                Reset Password
              </Button>
              </div>
              <div className="mb-0">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-[#850d0d] text-md hover:underline font-medium mx-auto block"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}