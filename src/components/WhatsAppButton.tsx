import React from 'react';
import { siteConfig } from '../data/siteConfig';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppButton({
  message,
  className = '',
  children,
}: WhatsAppButtonProps) {
  const basePhone = siteConfig.phone.replace('+', '');
  const url = message
    ? `https://wa.me/${basePhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${basePhone}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none ${className}`}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-5 h-5 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.419 9.86-9.86.001-2.636-1.02-5.11-2.871-6.963C16.591 1.915 14.121.895 11.99.895 6.55.895 2.128 5.317 2.126 10.76c-.001 1.722.453 3.4 1.315 4.888L2.435 20.3l4.212-1.146zm11.272-7.859c-.29-.145-1.716-.848-1.982-.944-.266-.096-.46-.145-.653.145-.193.291-.748.944-.917 1.137-.169.194-.338.217-.628.072-.29-.145-1.225-.452-2.333-1.441-.863-.77-1.445-1.721-1.614-2.012-.17-.29-.018-.448.127-.592.13-.13.29-.339.435-.509.145-.17.193-.29.29-.484.096-.194.048-.363-.024-.509-.072-.145-.653-1.573-.895-2.154-.236-.569-.475-.491-.653-.5-.169-.008-.362-.01-.555-.01-.193 0-.507.072-.772.363-.266.291-1.015.992-1.015 2.42 0 1.428 1.039 2.808 1.184 3.002.145.194 2.043 3.12 4.949 4.373.692.298 1.232.476 1.653.609.696.222 1.33.19 1.83.115.557-.083 1.716-.702 1.958-1.38.242-.678.242-1.258.17-1.38-.072-.12-.266-.193-.556-.339z" />
      </svg>
      {children || 'Order on WhatsApp'}
    </a>
  );
}
