'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react'; // Removed unused 'Star' import
import { supabase } from '@/lib/supabaseClient';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- State for both forms ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Additional states for Forgot Password form ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // NOTE: The 'securityCode' state was removed as Supabase handles this securely via email.

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setIsOpen(false);
      router.push('/admin'); // Redirect to admin page on successful login
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, 
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('If an account exists for this email, a password reset link has been sent.');
    }
    setIsLoading(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to login view when dialog closes
      setCurrentView('login');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setMessage(null);
      // Reset forgot password fields as well
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
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

          {/* Display Messages */}
          {error && <p className="text-sm text-center text-red-600 font-semibold mb-4">{error}</p>}
          {message && <p className="text-sm text-center text-green-700 font-semibold mb-4">{message}</p>}

          {currentView === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email-login" className="text-[#850d0d] font-bold text-base">
                  Email
                </Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2 relative">
                <Label htmlFor="password-login" className="text-[#850d0d] font-bold text-base">
                  Password
                </Label>
                <Input
                  id="password-login"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium pr-10" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 -translate-y-9 text-[#850d0d] hover:text-[#6b0a0a]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Login Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-5 text-lg font-bold mt-0 transition-colors duration-200"
                >
                  {isLoading ? 'Logging In...' : 'Login'}
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
              <div className="space-y-2">
                <Label htmlFor="email-forgot" className="text-[#850d0d] font-bold text-base">
                  Email
                </Label>
                <Input
                  id="email-forgot"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium"
                  required
                />
              </div>
              
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-4 text-lg font-bold mt-4 transition-colors duration-200"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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