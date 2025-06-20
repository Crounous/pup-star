'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react'; 
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
  const [currentView, setCurrentView] = useState<'login' | 'forgot_passcode' | 'forgot_reset'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- State for both forms ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Additional states for Forgot Password form ---
  const [passcode, setPasscode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('adminaccount')
      .select('username, password')
      .limit(1)
      .single();

    if (fetchError || !data) {
      setError('Could not verify credentials. Try again.');
      setIsLoading(false);
      return;
    }

    if (data.username === username && data.password === password) {
      localStorage.setItem('adminToken', 'authenticated');
      setIsOpen(false);
      router.push('/admin'); // Redirect on successful login
    } else {
      setError('Invalid username or password.');
    }
    
    setIsLoading(false);
  };

  const handlePasscodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

  const { data, error: fetchError } = await supabase
      .from('adminaccount')
      .select('passcode')
      .limit(1)
      .single();

  if (fetchError || !data) {
        setError('Could not verify passcode. Please contact an administrator.');
        setIsLoading(false);
        return;
    }

    if (data.passcode === passcode) {
        setCurrentView('forgot_reset'); // Move to the next step
    } else {
        setError('Incorrect passcode.');
    }

    setIsLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    // Update the password for the single account (assuming id = 1 or another fixed value).
    // Ensure you know the primary key of your single-row table.
    const { error: updateError } = await supabase
        .from('adminaccount')
        .update({ password: newPassword })
        .eq('id', 1); // IMPORTANT: Update based on your table's primary key for the single entry.

    if (updateError) {
        setError('Failed to update password. Please try again.');
    } else {
        setMessage('Password updated successfully. Please log in.');
        setCurrentView('login'); // Return to login view
    }

    setIsLoading(false);
  };
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCurrentView('login');
      setUsername('');
      setPassword('');
      setPasscode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setMessage(null);
    }
  };

  const defaultTrigger = (
    <Button className="bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] px-6 py-3 text-lg font-semibold">
      Staff Login
    </Button>
  );

  const renderContent = () => {
    switch(currentView) {
        // --- Forgot Password: Enter Passcode View ---
        case 'forgot_passcode':
            return (
                <form onSubmit={handlePasscodeCheck} className="space-y-6">
                    <p className="text-center text-[#850d0d] font-semibold">Enter the security passcode to reset your password.</p>
                    <div className="space-y-2">
                        <Label htmlFor="passcode" className="text-[#850d0d] font-bold text-base">
                            Passcode
                        </Label>
                        <Input
                          id="passcode"
                          type="password"
                          placeholder="Enter passcode"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
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
                          {isLoading ? 'Verifying...' : 'Verify Passcode'}
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
            );
        // --- Forgot Password: Reset Password View ---
        case 'forgot_reset':
            return (
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <p className="text-center text-[#850d0d] font-semibold">Enter your new password.</p>
                     {/* New Password Input */}
                    <div className="space-y-2 relative">
                        <Label htmlFor="new-password" className="text-[#850d0d] font-bold text-base">
                            New Password
                        </Label>
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 -translate-y-9 text-[#850d0d] hover:text-[#6b0a0a]">
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {/* Confirm Password Input */}
                    <div className="space-y-2 relative">
                        <Label htmlFor="confirm-password" className="text-[#850d0d] font-bold text-base">
                            Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-transparent border border-[#850d0d] rounded-lg px-4 py-3 text-[#850d0d] placeholder:text-[#850d0d]/60 focus:ring-2 focus:ring-[#850d0d] focus:border-[#850d0d] font-medium pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 -translate-y-9 text-[#850d0d] hover:text-[#6b0a0a]">
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-4 text-lg font-bold mt-4 transition-colors duration-200"
                        >
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            );
        // --- Login View ---
        case 'login':
        default:
            return (
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-2">
                        <Label htmlFor="username-login" className="text-[#850d0d] font-bold text-base">
                            Username
                        </Label>
                        <Input
                          id="username-login"
                          type="text"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
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

                    <div className="flex justify-center">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-60 bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a] rounded-full py-5 text-lg font-bold mt-0 transition-colors duration-200"
                        >
                          {isLoading ? 'Logging In...' : 'Login'}
                        </Button>
                    </div>

                    <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentView('forgot_passcode')}
                          className="text-[#850d0d] text-sm hover:underline font-medium"
                        >
                          Forgot Password?
                        </button>
                    </div>
                </form>
            );
    }
  }

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
          <div className="text-center mb-2">
            <div className="flex items-center justify-center mb-0">
              <img src="../PUPStarLogoRed.png" alt="PUP STAR Logo" className="w-auto h-14" style={{ margin: '-0.5rem' }}/>
            </div>
            <p className="text-[#850d0d] text-md font-semibold tracking-wider">
              ADMIN LOGIN
            </p>
          </div>

          {error && <p className="text-sm text-center text-red-600 font-semibold mb-4">{error}</p>}
          {message && <p className="text-sm text-center text-green-700 font-semibold mb-4">{message}</p>}

          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}