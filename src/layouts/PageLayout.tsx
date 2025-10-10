import { PropsWithChildren } from 'react';

import Navigation from '@/components/Navigation';
import { rubik } from '@/app/fonts';

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <div className={`${rubik.className} flex h-dvh flex-col bg-black text-white`}>
      <Navigation />

      {children}
    </div>
  );
}
