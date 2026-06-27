'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { siteConfig } from '../data/siteConfig';
import { useCustomerAuth } from '../context/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { customer, signInWithGoogle, logoutCustomer } = useCustomerAuth();

  // Detect scroll to style header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handlePlaceOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/shop') {
      e.preventDefault();
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  const handleMobileSignOut = async () => {
    await logoutCustomer();
    setIsOpen(false);
    router.push('/');
  };

  const handleMobileSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex flex-col">
              <span className="text-xl sm:text-2xl font-serif font-bold text-primary group-hover:text-primary-light transition-colors duration-200 tracking-tight">
                Divine Mane
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.25em] text-secondary group-hover:text-secondary-light transition-colors duration-200 uppercase -mt-1">
                Naturals
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-sans text-sm font-semibold tracking-wide transition-colors duration-300 py-2 ${
                  isLinkActive(link.href)
                    ? 'text-primary'
                    : 'text-dark/80 hover:text-primary'
                }`}
              >
                {link.name}
                {isLinkActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full animate-fade-in" />
                )}
              </Link>
            ))}
          </nav>

          {/* Header CTA & User Auth */}
          <div className="hidden lg:flex items-center space-x-6">
            {customer ? (
              <div className="relative group">
                <button className="flex items-center gap-2.5 font-sans text-sm font-bold text-primary focus:outline-none py-2 cursor-pointer">
                  {customer.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customer.photoURL}
                      alt={customer.name}
                      className="w-8 h-8 rounded-full border border-primary/10 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      {customer.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">Hi, {customer.name.split(' ')[0]}</span>
                  <svg className="w-3.5 h-3.5 text-dark/50 group-hover:text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 w-48 mt-1 bg-white rounded-2xl border border-primary/5 shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <Link
                    href="/my-orders"
                    className="block px-4 py-2.5 text-sm text-dark/80 hover:bg-brand-bg/50 hover:text-primary font-semibold transition-colors duration-150"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logoutCustomer}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors duration-150 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="font-sans text-sm font-semibold text-dark/85 hover:text-primary transition-colors duration-200 focus:outline-none cursor-pointer"
              >
                Sign In
              </button>
            )}

            <Link
              href="/order"
              onClick={handlePlaceOrderClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-sm cursor-pointer"
            >
              Place an Order
            </Link>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-primary-light hover:bg-primary/5 focus:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-6 space-y-1 bg-brand-bg/95 border-b border-primary/10 shadow-lg px-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-3 rounded-md text-base font-semibold tracking-wide transition-all duration-200 ${
                isLinkActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-dark/80 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* User auth links inside mobile menu */}
          {customer ? (
            <div className="pt-4 border-t border-primary/10 px-3 space-y-3">
              <div className="flex items-center gap-3 px-3 py-1">
                {customer.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.photoURL}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full border border-primary/15 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                    {customer.name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-primary leading-tight">{customer.name}</div>
                  <div className="text-[11px] text-dark/60 leading-none mt-1">{customer.email}</div>
                </div>
              </div>
              <Link
                href="/my-orders"
                className="block text-base font-bold text-primary px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                My Orders
              </Link>
              <button
                onClick={handleMobileSignOut}
                className="block w-full text-left text-base font-semibold text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-primary/10 px-3">
              <button
                onClick={handleMobileSignIn}
                className="block w-full text-left text-base font-semibold text-dark/80 px-3 py-2 rounded-lg hover:bg-primary/5 cursor-pointer"
              >
                Sign In / Join
              </button>
            </div>
          )}

          <div className="pt-4 pb-2 px-3">
            <Link
              href="/order"
              onClick={handlePlaceOrderClick}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-center cursor-pointer"
            >
              Place an Order
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
