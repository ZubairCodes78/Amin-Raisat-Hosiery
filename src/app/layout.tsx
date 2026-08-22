import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { PublicLayoutShell } from '@/components/layout/PublicLayoutShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aminraisathosiery.com'),
  title: "Amin Raisat Hosiery — Men's Pure Cotton Vests & Innerwear Pakistan",
  description:
    "Shop premium 100% combed cotton Men's Vests in High Quality (taped seams) and Standard Quality. Nationwide delivery across Pakistan with Free Delivery on 4+ pieces.",
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
    'Half Sleeves Vest',
    'Combed Cotton Innerwear',
  ],
  authors: [{ name: 'Muhammad Amin' }],
  openGraph: {
    title: 'Amin Raisat Hosiery — Men’s Innerwear Pakistan',
    description:
      'Premium 100% fine combed cotton vests. Available in High Quality & Standard Quality options. Free Delivery on 4+ pieces across Pakistan.',
    siteName: 'Amin Raisat Hosiery',
    images: [{ url: '/images/Logo.png', width: 800, height: 800, alt: 'Amin Raisat Hosiery' }],
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
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-accent selection:text-white">
        <StoreProvider>
          <CartProvider>
            <PublicLayoutShell>{children}</PublicLayoutShell>
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
