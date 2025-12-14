import * as React from 'react';
import { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';

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
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

