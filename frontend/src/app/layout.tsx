import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { siteConfig } from "../data/siteConfig";
import { CustomerAuthProvider } from "../context/AuthContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: 'https://res.cloudinary.com/cbwjre6r/image/upload/v1782417477/divine-mane-naturals/lifestyle/product-range.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Moringa Hair Care Range`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ['https://res.cloudinary.com/cbwjre6r/image/upload/v1782417477/divine-mane-naturals/lifestyle/product-range.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-dark font-sans">
        <CustomerAuthProvider>
          <Header />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
