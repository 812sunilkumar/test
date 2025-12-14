import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nevo Test Drive',
  description: 'Book your test drive with Nevo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-gray-50">
        {children}
      </body>
    </html>
  );
}

