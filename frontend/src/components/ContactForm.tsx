'use client';

import React, { useState } from 'react';
import { siteConfig } from '../data/siteConfig';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // Validate email
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      setLoading(false);
      return;
    }

    try {
      // If EmailJS has placeholder keys, simulate sending
      if (
        siteConfig.emailJs.publicKey === 'user_divinemane_key' ||
        siteConfig.emailJs.serviceId === 'service_divinemane'
      ) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Simulating EmailJS send with data:', formData);
        setStatus({
          type: 'success',
          message: 'Message sent successfully! (Demo Mode - Placeholder keys used)',
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        // Real EmailJS Send using dynamic import to keep initial bundle light
        const emailjs = (await import('@emailjs/browser')).default;
        await emailjs.send(
          siteConfig.emailJs.serviceId,
          siteConfig.emailJs.templateId,
          {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_email: siteConfig.email,
          },
          siteConfig.emailJs.publicKey
        );

        setStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully.',
        });
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Contact Form Error:', error);
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try contacting us via WhatsApp directly.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status.type && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold ${
            status.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          } animate-fade-in`}
        >
          {status.message}
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Mwape Muloboko"
          className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 text-dark"
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 text-dark"
        />
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
          Your Message
        </label>
        <textarea
          name="message"
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we help you transform your hair routine?"
          className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 text-dark resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl bg-primary text-white font-serif font-bold text-base hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer ${
          loading ? 'opacity-80 cursor-wait' : ''
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
