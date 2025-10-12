import { PropsWithChildren } from 'react';

import Navigation from '@/components/Navigation';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import { rubik } from '@/app/fonts';

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <ShoppingCartProvider>
      <div className={`${rubik.className} flex h-dvh flex-col bg-black text-white`}>
        <Navigation />

        {children}
      </div>
    </ShoppingCartProvider>
  );
}
