'use client';

import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';

import { cars } from '@/cars';
import { calculateCarDetailsPrice } from '@/carDetails';
import { useShoppingCart } from '@/contexts/ShoppingCartContext';
import { capitalizeWords, formatPrice } from '@/lib/utils';

export default function ShoppingCart() {
  const { cart, removeFromCart } = useShoppingCart();

  const cartCost = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc + cars[item.carIndex].price + calculateCarDetailsPrice(item.details),
        0,
      ),
    [cart, cars],
  );

  return (
    <div className="flex size-full justify-center">
      <div className="flex h-min flex-col gap-5 rounded-md bg-neutral-950 p-10">
        <h2 className="mb-5 text-center text-3xl font-semibold">Shopping cart</h2>

        <div className="grid max-h-[45vh] gap-12 overflow-scroll rounded-md bg-neutral-900 px-10 py-6">
          {cart.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_4fr_1fr] place-items-center gap-10"
              key={index}
            >
              <button
                onClick={() => removeFromCart(index)}
                className="grid size-10 cursor-pointer place-items-center rounded-md border border-rose-500 bg-rose-500/20 transition hover:brightness-125"
              >
                <Trash2 size={22} />
              </button>

              <div className="grid place-items-center gap-4">
                <span className="text-center text-3xl font-semibold">
                  {cars[item.carIndex].name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-teal-300/30 px-3 py-1 text-sm font-medium">
                    {item.details.wheels.rimSize}″
                  </span>
                  <span className="rounded-sm bg-teal-300/30 px-3 py-1 text-sm font-medium">
                    {capitalizeWords(item.details.wheels.material)}
                  </span>
                  <span className="rounded-sm bg-rose-300/30 px-3 py-1 text-sm font-medium">
                    {capitalizeWords(item.details.engine.tuning)}
                  </span>
                  <span className="rounded-sm bg-rose-300/30 px-3 py-1 text-sm font-medium">
                    {capitalizeWords(item.details.engine.fuel)}
                  </span>
                  <span className="rounded-sm bg-indigo-300/30 px-3 py-1 text-sm font-medium">
                    {capitalizeWords(item.details.glass.type)}
                  </span>
                  <span className="rounded-sm bg-indigo-300/30 px-3 py-1 text-sm font-medium">
                    {capitalizeWords(item.details.glass.tint)}
                  </span>
                </div>
              </div>

              <span className="text-2xl font-semibold">
                <span className="mr-0.5 text-xl">$</span>
                {formatPrice(
                  cars[item.carIndex].price + calculateCarDetailsPrice(item.details),
                )}
              </span>
            </div>
          ))}
        </div>

        <span className="h-[2px] w-full rounded-full bg-indigo-300"></span>

        <div className="flex items-center justify-between rounded-md border-2 border-indigo-500 bg-indigo-500/20 p-4">
          <span className="flex items-center font-medium">
            <span className="mr-2">Total cost:</span>
            <span className="mr-0.5 text-sm">$</span>
            <span className="font-semibold">{formatPrice(cartCost)}</span>
          </span>

          <button className="cursor-pointer rounded-sm bg-indigo-500/50 px-6 py-2 font-semibold transition hover:brightness-125">
            Order now
          </button>
        </div>
      </div>
    </div>
  );
}
