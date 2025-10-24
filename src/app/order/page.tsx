import { Check } from 'lucide-react';

import { poppins } from '@/app/fonts';

export default function Order() {
  return (
    <div className="flex size-full justify-center">
      <div className="flex h-min flex-col items-center rounded-md bg-neutral-950 p-6">
        <div className="grid w-full gap-2">
          <div className="flex items-center gap-6 px-16">
            <div className="grid w-min place-items-center rounded-full bg-emerald-600 p-1">
              <span
                className={`${poppins.className} grid size-8 place-items-center rounded-full bg-emerald-600 text-xl`}
              >
                <Check size={24} />
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="h-0.5 w-20 bg-emerald-600"></span>
              <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full bg-emerald-600"></span>
              <span className="h-0.5 w-20 bg-emerald-600"></span>
            </div>
            <div className="grid w-min place-items-center rounded-full border-2 border-emerald-600 p-0.5">
              <span
                className={`${poppins.className} grid size-8 place-items-center rounded-full bg-emerald-600 text-xl`}
              >
                2
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="h-0.5 w-20 bg-emerald-600"></span>
              <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full bg-emerald-600"></span>
              <span className="h-0.5 w-20 bg-white"></span>
            </div>
            <div className="grid w-min place-items-center rounded-full border-2 border-white p-0.5">
              <span
                className={`${poppins.className} grid size-8 place-items-center rounded-full text-xl`}
              >
                3
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="h-0.5 w-20 bg-white"></span>
              <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full bg-white"></span>
              <span className="h-0.5 w-20 bg-white"></span>
            </div>
            <div className="grid w-min place-items-center rounded-full border-2 border-white p-0.5">
              <span
                className={`${poppins.className} grid size-8 place-items-center rounded-full text-xl`}
              >
                4
              </span>
            </div>
          </div>
          <div className="flex items-center gap-[7rem] px-5">
            <div className="text-center text-lg">Contact Details</div>
            <div className="text-center text-lg">Shipping Details</div>
            <div className="text-center text-lg">Payment Details</div>
            <div className="text-center text-lg">Final Verification</div>
          </div>
        </div>
      </div>
    </div>
  );
}
