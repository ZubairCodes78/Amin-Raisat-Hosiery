import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { PublicLayoutShell } from '@/components/layout/PublicLayoutShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aminraisathosiery.com'),
  title: "Amin Raisat Hosiery — Pure Cotton Vests & Innerwear Pakistan",
  description:
    "Shop premium 100% fine combed cotton Men's Vests in High Quality (taped seams) and Standard Quality. Nationwide delivery across Pakistan with Free Delivery on 3+ pieces.",
  icons: {
    icon: '/images/Favicon Logo.jpeg',
    shortcut: '/images/Favicon Logo.jpeg',
    apple: '/images/Favicon Logo.jpeg',
  },
  keywords: [
    'Amin Raisat Hosiery',
    'Men Vest Pakistan',
    'Cotton Banyan Pakistan',
    'Sando Vest',
    'Full Sleeve Vest',
    'Combed Cotton Innerwear',
    'Faisalabad Hosiery',
  ],
  authors: [{ name: 'Muhammad Amin' }],
  openGraph: {
    title: 'Amin Raisat Hosiery — Pure Cotton Innerwear Pakistan',
    description:
      'Premium 100% fine combed cotton vests and innerwear. Free Delivery on 3+ pieces across Pakistan.',
    siteName: 'Amin Raisat Hosiery',
    images: [{ url: '/images/header logo.png', width: 800, height: 300, alt: 'Amin Raisat Hosiery' }],
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-dark-bg text-gray-100 antialiased selection:bg-gold-500 selection:text-black">
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <PublicLayoutShell>{children}</PublicLayoutShell>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
