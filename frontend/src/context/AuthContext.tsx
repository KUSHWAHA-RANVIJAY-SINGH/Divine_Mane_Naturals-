'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { googleLogin, Customer } from '../lib/api';

interface AuthContextType {
  customer: Customer | null;
  customerToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logoutCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<AuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state on load
  useEffect(() => {
    const savedCustomer = localStorage.getItem('customerInfo');
    const savedToken = localStorage.getItem('customerToken');
    
    if (savedCustomer && savedToken) {
      try {
        setCustomer(JSON.parse(savedCustomer));
        setCustomerToken(savedToken);
      } catch (e) {
        console.error('Error parsing customer cache', e);
      }
    }
    setLoading(false);

    // Watch Firebase Auth State
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          const response = await googleLogin(token);
          
          setCustomer(response.customer);
          setCustomerToken(token);

          localStorage.setItem('customerToken', token);
          localStorage.setItem('customerInfo', JSON.stringify(response.customer));

          // Set legacy storage variables for backward compatibility
          localStorage.setItem('userName', response.customer.name);
          localStorage.setItem('userEmail', response.customer.email);
          localStorage.setItem('userToken', token);
          
          window.dispatchEvent(new Event('storage'));
        } catch (error) {
          console.error('Firebase Auth sync error:', error);
          handleLogoutCleanup();
        }
      } else {
        handleLogoutCleanup();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutCleanup = () => {
    setCustomer(null);
    setCustomerToken(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerInfo');
    
    // Legacy cleanup
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userToken');
    window.dispatchEvent(new Event('storage'));
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(true);
      const response = await googleLogin(token);

      setCustomer(response.customer);
      setCustomerToken(token);

      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerInfo', JSON.stringify(response.customer));
      
      localStorage.setItem('userName', response.customer.name);
      localStorage.setItem('userEmail', response.customer.email);
      localStorage.setItem('userToken', token);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Google Sign-In Popup Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutCustomer = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      handleLogoutCleanup();
    } catch (error) {
      console.error('Firebase Logout Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        customerToken,
        loading,
        signInWithGoogle,
        logoutCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
