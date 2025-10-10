'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { animate } from 'motion/react';
import {
  CarFront,
  Check,
  ClipboardList,
  Eye,
  LifeBuoy,
  Play,
  ShoppingBasket,
  SquareDashedMousePointer,
} from 'lucide-react';

import { cars } from '@/cars';
import {
  calculateCarDetailsPrice,
  calculateEnginePrice,
  calculateGlassPrice,
  calculateWheelsPrice,
  CarDetailsOptions,
  defaultCarDetails,
  type CarDetails,
} from '@/carDetails';
import {
  CarSelectionScene,
  type CarPresentationState,
} from '@/lib/scenes/CarSelectionScene';
import { Miliseconds } from '@/lib/types';
import { capitalizeWords, cn, formatPrice } from '@/lib/utils';

function DetailsModalOption({
  headerText,
  size,
  options,
  currentOption,
  formatOption,
  selectOption,
  className,
  ...props
}: ComponentProps<'div'> & {
  headerText: string;
  size: 'md' | 'sm';
  options: Record<string, number>;
  currentOption: string | number;
  formatOption?: (option: string) => string;
  selectOption: (option: string) => void;
}) {
  return (
    <div className={cn('flex flex-col gap-4 px-4', className)} {...props}>
      <span className="text-center font-semibold">{headerText}</span>
      <div className="grid gap-2 pl-4">
        {Object.keys(options).map(option => (
          <button
            onClick={() => selectOption(option)}
            className={`${currentOption == option ? 'bg-neutral-900 **:text-teal-200' : ''} ${size == 'md' ? 'py-2.5' : 'py-1'} group flex cursor-pointer items-center gap-4 rounded-md px-4`}
            key={option}
          >
            <Check
              size={20}
              className={`${currentOption == option ? '' : 'opacity-0'} stroke-3 transition duration-300 group-hover:text-teal-200`}
            />
            <div
              className={`${size == 'md' ? 'text-sm' : ''} flex w-full items-center justify-between font-medium transition duration-300 group-hover:text-teal-200`}
            >
              <span>{formatOption ? formatOption(option) : option}</span>
              <span>
                <span className="mr-0.5 text-sm">$</span>
                {formatPrice(options[option])}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CarSelectionScene>(null);
  const [carIndex, setCarIndex] = useState<number>();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const scene = setupScene();

    async function setupScene() {
      const scene = await CarSelectionScene.create(canvas, cars);
      sceneRef.current = scene;

      setCarIndex(scene.currentIndex);

      return scene;
    }

    return () => void scene.then(scene => scene.destroy());
  }, []);

  const carTransitionPlaying = useRef(false);
  const [previousSwitchEnabled, setPreviousSwitchEnabled] = useState(true);
  const [nextSwitchEnabled, setNextSwitchEnabled] = useState(true);

  const switchCar = async (direction: 'backward' | 'forward') => {
    const scene = sceneRef.current;

    if (!scene || carTransitionPlaying.current) return;

    setPreviousSwitchEnabled(false);
    setNextSwitchEnabled(false);
    carTransitionPlaying.current = true;

    await scene.switchCar(direction);

    setCarIndex(scene.currentIndex);

    if (scene.canSwitchBackwards) {
      setPreviousSwitchEnabled(true);
    }

    if (scene.canSwitchForward) {
      setNextSwitchEnabled(true);
    }

    carTransitionPlaying.current = false;
  };

  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      'keydown',
      event => {
        if (event.key === 'ArrowLeft') {
          switchCar('backward');
        }

        if (event.key === 'ArrowRight') {
          switchCar('forward');
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  const detailsModalTriggerRef = useRef<HTMLButtonElement>(null);
  const detailsModalRef = useRef<HTMLDivElement>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalState, setDetailsModalState] =
    useState<CarPresentationState>('default');

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (showDetailsModal) {
      scene.toggleRotationIndicator(false);
      scene.autoRotateTimestamp = Infinity as Miliseconds;
    }
  }, [showDetailsModal]);

  useEffect(() => {
    const detailsModalTrigger = detailsModalTriggerRef.current!;
    const detailsModal = detailsModalRef.current!;

    const controller = new AbortController();

    document.addEventListener(
      'pointerdown',
      event => {
        const target = event.target as Node;

        if (!detailsModalTrigger.contains(target) && !detailsModal.contains(target)) {
          setShowDetailsModal(false);
          setDetailsModalState('default');
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const detailsModal = detailsModalRef.current!;

    const modalAnimationMap: Record<
      CarPresentationState,
      { width: number; height: number; x: number; y: number }
    > = {
      default: {
        width: 600,
        height: 460,
        x: window.innerWidth - 600 - 40,
        y: (window.innerHeight - 460) / 2,
      },
      wheels: {
        width: 800,
        height: 360,
        x: (window.innerWidth - 800) / 2,
        y: 60,
      },
      engine: {
        width: 800,
        height: 360,
        x: (window.innerWidth - 800) / 2,
        y: window.innerHeight - 360 - 40,
      },
      glass: {
        width: 600,
        height: 460,
        x: 0.25 * window.innerWidth - 600 / 2,
        y: (window.innerHeight - 460) / 2,
      },
    };

    const { width, height, x, y } = modalAnimationMap[detailsModalState];

    animate(
      detailsModal,
      { width, height, x, y },
      { type: 'spring', stiffness: 150, damping: 30 },
    );
  }, [detailsModalState]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.animateCarState(detailsModalState);
  }, [detailsModalState]);

  const [carDetails, setCarDetails] = useState<CarDetails>(defaultCarDetails);

  return (
    <>
      <canvas ref={canvasRef} className="absolute z-10 h-dvh w-dvw"></canvas>

      <div
        ref={detailsModalRef}
        className={`${!showDetailsModal ? 'pointer-events-none scale-y-50 opacity-0' : ''} absolute z-30 origin-bottom rounded-md transition duration-300 ease-out`}
      >
        <div className="flex h-full flex-col gap-6 rounded-lg bg-neutral-950 p-6 text-white">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setDetailsModalState('default')}
              className={`${detailsModalState == 'default' ? 'bg-teal-300 text-black' : 'bg-neutral-900 text-teal-300 hover:brightness-125'} flex cursor-pointer items-center gap-2 rounded-md p-2 transition duration-300`}
            >
              <ClipboardList size={20} />
              <span className="text-sm font-semibold">Summary</span>
            </button>
            <button
              onClick={() => setDetailsModalState('wheels')}
              className={`${detailsModalState == 'wheels' ? 'bg-teal-300 text-black' : 'bg-neutral-900 text-teal-300 hover:brightness-125'} flex cursor-pointer items-center gap-2 rounded-md p-2 transition duration-300`}
            >
              <LifeBuoy size={20} />
              <span className="text-sm font-semibold">Wheel rims</span>
            </button>
            <button
              onClick={() => setDetailsModalState('engine')}
              className={`${detailsModalState == 'engine' ? 'bg-teal-300 text-black' : 'bg-neutral-900 text-teal-300 hover:brightness-125'} flex cursor-pointer items-center gap-2 rounded-md p-2 transition duration-300`}
            >
              <CarFront size={20} />
              <span className="text-sm font-semibold">Engine tuning</span>
            </button>
            <button
              onClick={() => setDetailsModalState('glass')}
              className={`${detailsModalState == 'glass' ? 'bg-teal-300 text-black' : 'bg-neutral-900 text-teal-300 hover:brightness-125'} flex cursor-pointer items-center gap-2 rounded-md p-2 transition duration-300`}
            >
              <Eye size={20} />
              <span className="text-sm font-semibold">Glass options</span>
            </button>
          </div>

          {detailsModalState == 'default' ? (
            <>
              <div className="grid overflow-hidden rounded-lg bg-neutral-900">
                <div className="grid grid-cols-[4fr_1fr] bg-neutral-800 p-4">
                  <span className="font-semibold">
                    {carIndex !== undefined ? cars[carIndex].name : null}
                  </span>
                  <span className="flex items-center font-semibold">
                    <span className="mr-0.5 text-sm">$</span>
                    {carIndex !== undefined ? formatPrice(cars[carIndex].price) : null}
                  </span>
                </div>
                <div className="grid grid-cols-[2fr_2fr_1fr] p-4">
                  <span className="text-sm font-medium">Wheel rims</span>
                  <span className="text-sm font-semibold">
                    {carDetails.wheels.rimSize}″, {carDetails.wheels.material}
                  </span>
                  <span className="flex items-center font-semibold">
                    <span className="mr-0.5 text-sm">$</span>
                    {formatPrice(calculateWheelsPrice(carDetails))}
                  </span>
                </div>
                <div className="grid grid-cols-[2fr_2fr_1fr] p-4">
                  <span className="text-sm font-medium">Engine tuning</span>
                  <span className="text-sm font-semibold">
                    {carDetails.engine.tuning}, {carDetails.engine.fuel}
                  </span>
                  <span className="flex items-center font-semibold">
                    <span className="mr-0.5 text-sm">$</span>
                    {formatPrice(calculateEnginePrice(carDetails))}
                  </span>
                </div>
                <div className="grid grid-cols-[2fr_2fr_1fr] p-4">
                  <span className="text-sm font-medium">Glass options</span>
                  <span className="text-sm font-semibold">
                    {carDetails.glass.type}, {carDetails.glass.tint}
                  </span>
                  <span className="flex items-center font-semibold">
                    <span className="mr-0.5 text-sm">$</span>
                    {formatPrice(calculateGlassPrice(carDetails))}
                  </span>
                </div>
                <div className="grid grid-cols-[4fr_1fr] bg-neutral-800 p-4">
                  <span className="font-semibold">Total cost</span>
                  <span className="flex items-center font-semibold">
                    <span className="mr-0.5 text-sm">$</span>
                    {carIndex !== undefined
                      ? formatPrice(
                          cars[carIndex].price + calculateCarDetailsPrice(carDetails),
                        )
                      : null}
                  </span>
                </div>
              </div>

              <button className="relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-teal-300 py-3 text-black shadow-[0_6px_0_0] shadow-teal-600 transition ease-out hover:brightness-125 active:translate-y-2 active:shadow-none">
                <ShoppingBasket />
                <span className="font-semibold">Add to cart</span>
              </button>
            </>
          ) : detailsModalState == 'wheels' ? (
            <div className="my-auto grid grid-cols-3">
              <DetailsModalOption
                headerText="Wheel rim size (in inches)"
                size="sm"
                options={CarDetailsOptions.wheels.rimSize}
                currentOption={carDetails.wheels.rimSize}
                formatOption={option => `${option}″`}
                selectOption={option =>
                  setCarDetails({
                    ...carDetails,
                    wheels: {
                      material: carDetails.wheels.material,
                      rimSize:
                        option as unknown as keyof typeof CarDetailsOptions.wheels.rimSize,
                    },
                  })
                }
              />
              <DetailsModalOption
                headerText="Wheel rim material"
                size="md"
                options={CarDetailsOptions.wheels.material}
                currentOption={carDetails.wheels.material}
                formatOption={capitalizeWords}
                selectOption={option =>
                  setCarDetails({
                    ...carDetails,
                    wheels: {
                      rimSize: carDetails.wheels.rimSize,
                      material: option as keyof typeof CarDetailsOptions.wheels.material,
                    },
                  })
                }
              />
              <div className="flex flex-col gap-4 px-4">
                <span className="text-center font-semibold">Total wheel rims cost</span>
                <span className="rounded-md bg-neutral-800 py-2 text-center font-semibold text-white">
                  <span className="mr-0.5 text-sm">$</span>
                  {formatPrice(calculateWheelsPrice(carDetails))}
                </span>
              </div>
            </div>
          ) : detailsModalState == 'engine' ? (
            <div className="my-auto grid grid-cols-3">
              <DetailsModalOption
                headerText="Engine tuning"
                size="md"
                options={CarDetailsOptions.engine.tuning}
                currentOption={carDetails.engine.tuning}
                formatOption={capitalizeWords}
                selectOption={option =>
                  setCarDetails({
                    ...carDetails,
                    engine: {
                      fuel: carDetails.engine.fuel,
                      tuning:
                        option as unknown as keyof typeof CarDetailsOptions.engine.tuning,
                    },
                  })
                }
              />
              <DetailsModalOption
                headerText="Engine fuel"
                size="md"
                options={CarDetailsOptions.engine.fuel}
                currentOption={carDetails.engine.fuel}
                formatOption={capitalizeWords}
                selectOption={option =>
                  setCarDetails({
                    ...carDetails,
                    engine: {
                      tuning: carDetails.engine.tuning,
                      fuel: option as keyof typeof CarDetailsOptions.engine.fuel,
                    },
                  })
                }
              />
              <div className="flex flex-col gap-4 px-4">
                <span className="text-center font-semibold">Total engine cost</span>
                <span className="rounded-md bg-neutral-800 py-2 text-center font-semibold text-white">
                  <span className="mr-0.5 text-sm">$</span>
                  {formatPrice(calculateEnginePrice(carDetails))}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-col gap-3 px-4">
                <span className="text-center font-semibold">Total glass cost</span>
                <span className="rounded-md bg-neutral-800 py-2 text-center font-semibold text-white">
                  <span className="mr-0.5 text-sm">$</span>
                  {formatPrice(calculateGlassPrice(carDetails))}
                </span>
              </div>
              <div className="my-auto grid grid-cols-2">
                <DetailsModalOption
                  headerText="Glass type"
                  size="md"
                  options={CarDetailsOptions.glass.type}
                  currentOption={carDetails.glass.type}
                  formatOption={capitalizeWords}
                  selectOption={option =>
                    setCarDetails({
                      ...carDetails,
                      glass: {
                        tint: carDetails.glass.tint,
                        type: option as unknown as keyof typeof CarDetailsOptions.glass.type,
                      },
                    })
                  }
                />
                <DetailsModalOption
                  headerText="Glass tint"
                  size="md"
                  options={CarDetailsOptions.glass.tint}
                  currentOption={carDetails.glass.tint}
                  formatOption={capitalizeWords}
                  selectOption={option =>
                    setCarDetails({
                      ...carDetails,
                      glass: {
                        type: carDetails.glass.type,
                        tint: option as keyof typeof CarDetailsOptions.glass.tint,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`${detailsModalState != 'default' ? 'pointer-events-none opacity-0' : ''} absolute right-20 bottom-20 left-20 z-20 flex items-center justify-between transition`}
      >
        <button disabled={!previousSwitchEnabled} onClick={() => switchCar('backward')}>
          <Play
            size={64}
            className={`${previousSwitchEnabled ? 'cursor-pointer stroke-white drop-shadow-[0_0_5px_white] hover:fill-white hover:drop-shadow-[0_0_15px_white]' : 'cursor-not-allowed stroke-neutral-800 drop-shadow-none'} rotate-180 fill-neutral-950 stroke-2 transition`}
          />
        </button>

        <div className="grid gap-6 rounded-xl p-6 backdrop-blur-xs backdrop-brightness-90">
          <span className="text-4xl font-semibold [text-shadow:0px_0px_5px_black]">
            {carIndex !== undefined ? cars[carIndex].name : null}
          </span>
          <button
            ref={detailsModalTriggerRef}
            onClick={() => setShowDetailsModal(true)}
            className="relative mx-auto flex w-fit cursor-pointer items-center justify-center gap-3 px-1 text-xl font-semibold after:absolute after:right-0 after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-white"
          >
            Buy & See more details <SquareDashedMousePointer />
          </button>
        </div>

        <button disabled={!nextSwitchEnabled} onClick={() => switchCar('forward')}>
          <Play
            size={64}
            className={`${nextSwitchEnabled ? 'cursor-pointer stroke-white drop-shadow-[0_0_5px_white] hover:fill-white hover:drop-shadow-[0_0_15px_white]' : 'cursor-not-allowed stroke-neutral-800 drop-shadow-none'} fill-neutral-950 stroke-2 transition`}
          />
        </button>
      </div>
    </>
  );
}
