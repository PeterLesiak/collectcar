'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Handbag } from 'lucide-react';

import { poppins } from '@/app/fonts';
import { cn } from '@/lib/utils';
import { useShoppingCart } from '@/contexts/ShoppingCartContext';

export default function Navigation({ className, ...props }: ComponentProps<'nav'>) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarTriggerRef = useRef<HTMLDivElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const sidebar = sidebarRef.current!;
    const siderbarTrigger = sidebarTriggerRef.current!;

    const controller = new AbortController();

    document.addEventListener(
      'click',
      event => {
        const target = event.target as Node;

        if (!sidebar.contains(target) && !siderbarTrigger.contains(target)) {
          setSidebarOpen(false);
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  const { cart } = useShoppingCart();

  return (
    <nav
      className={cn(
        'relative z-30 flex items-center justify-between px-20 py-10',
        className,
      )}
      {...props}
    >
      <div
        ref={sidebarRef}
        className={`${sidebarOpen ? '' : 'scale-x-0'} absolute top-0 left-0 flex h-dvh min-w-[420px] origin-left flex-col items-center bg-black p-10 transition duration-300`}
      >
        <span className="mt-auto text-xl font-medium">Built with ❤️ by Piotr Lesiak</span>
      </div>

      <div ref={sidebarTriggerRef} className="flex items-center gap-14">
        <a
          href="/"
          className={`${poppins.className} relative text-3xl font-semibold after:absolute after:right-0 after:-bottom-2 after:left-0 after:h-1 after:origin-left after:scale-x-0 after:bg-white after:transition hover:after:scale-x-100`}
        >
          collectcar.
        </a>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-pressed={sidebarOpen}
          className="group relative inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full p-2 text-center text-white transition hover:bg-neutral-950"
        >
          <span className="sr-only">Menu</span>
          <svg className="pointer-events-none h-6 w-6 fill-current" viewBox="0 0 16 16">
            <rect
              className="origin-center translate-x-[7px] -translate-y-[5px] transition-all duration-500 ease-[cubic-bezier(.5,.85,.25,1.1)] group-[[aria-pressed=true]]:translate-x-0 group-[[aria-pressed=true]]:translate-y-0 group-[[aria-pressed=true]]:rotate-[315deg]"
              y="7"
              width="9"
              height="2"
              rx="1"
            />
            <rect
              className="origin-center transition-all duration-500 ease-[cubic-bezier(.5,.85,.25,1.8)] group-[[aria-pressed=true]]:rotate-45"
              y="7"
              width="16"
              height="2"
              rx="1"
            />
            <rect
              className="origin-center translate-y-[5px] transition-all duration-500 ease-[cubic-bezier(.5,.85,.25,1.1)] group-[[aria-pressed=true]]:translate-y-0 group-[[aria-pressed=true]]:rotate-[135deg]"
              y="7"
              width="9"
              height="2"
              rx="1"
            />
          </svg>
        </button>
      </div>

      <Link
        href="/shopping-cart"
        aria-label="Shopping cart"
        className="group relative grid aspect-square place-items-center rounded-full bg-white p-2 transition duration-500 hover:bg-neutral-950"
      >
        <Handbag className="stroke-black transition duration-500 group-hover:stroke-white" />

        <div className="absolute -bottom-3.5 -left-3 rounded-full bg-black p-0.5">
          <span
            className={`${poppins.className} grid size-5.5 place-items-center rounded-full bg-red-500 text-sm font-semibold text-white transition duration-500 group-hover:bg-white group-hover:text-neutral-950`}
          >
            {cart.length}
          </span>
        </div>
      </Link>
    </nav>
  );
}
