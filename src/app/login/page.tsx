'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser, signupUser } from '../../lib/api';

function CustomerLoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/') : '/';

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      router.push(redirectPath);
    }
  }, [router, redirectPath]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userPhone', data.user.phone);
      localStorage.setItem('userId', data.user.id);

      setSuccess('Logged in successfully!');
      
      // Dispatch custom event to update Header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }

      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const data = await signupUser({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
      });

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userPhone', data.user.phone);
      localStorage.setItem('userId', data.user.id);

      setSuccess('Account created successfully!');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }

      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-brand-bg/20">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-primary/5 shadow-xl space-y-8 animate-fade-in">
        {/* Toggle Header */}
        <div className="text-center">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em] block mb-1">
            Mane Member Portal
          </span>
          <h1 className="text-3xl font-serif font-bold text-primary">
            {isLogin ? 'Welcome Back' : 'Join Divine Mane'}
          </h1>
          <p className="text-dark/65 text-xs sm:text-sm mt-2">
            {isLogin 
              ? 'Log in to auto-fill checkouts and track your orders.' 
              : 'Create an account to unlock order history and faster checkout.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-primary/5 p-1 rounded-2xl border border-primary/10">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-grow py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
              isLogin ? 'bg-primary text-white shadow-md' : 'text-dark/60 hover:text-primary'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-grow py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
              !isLogin ? 'bg-primary text-white shadow-md' : 'text-dark/60 hover:text-primary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-xl text-center animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl text-center animate-fade-in">
            ✅ {success}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label htmlFor="login_email" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="login_email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. customer@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <div>
              <label htmlFor="login_password" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login_password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-primary transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-primary text-white font-serif font-bold text-base rounded-xl hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup_name" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="signup_name"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Mwape Muloboko"
                className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup_email" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="signup_email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g. mwape@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup_phone" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="signup_phone"
                required
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="e.g. +260974572834"
                className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup_password" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup_password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup_confirm_password" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup_confirm_password"
                required
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-primary text-white font-serif font-bold text-base rounded-xl hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[75vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <CustomerLoginContent />
    </Suspense>
  );
}
