import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import PageLayout from '@/layouts/PageLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Home - collectcar.',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PageLayout>{children}</PageLayout>
      </body>
    </html>
  );
}
