/** Price is in USD */
export const CarDetailsOptions = {
  wheels: {
    /** Rim size is in inches (″) */
    rimSize: {
      [16]: 146.99,
      [17]: 179.33,
      [18]: 238.36,
      [19]: 313.01,
      [20]: 441.35,
    },

    material: {
      ['steel']: 0,
      ['alloy']: 85,
      ['forged']: 297,
      ['carbon fiber']: 810,
    },
  },

  engine: {
    tuning: {
      ['chip tuning']: 386,
      ['ECU remap']: 550,
      ['dyno tune']: 1050,
      ['power pack']: 2240,
    },

    fuel: {
      ['petrol']: 0,
      ['diesel']: 137,
      ['hybrid']: 550,
      ['electric']: 789,
    },
  },

  glass: {
    type: {
      ['tempered']: 92,
      ['laminated']: 187,
      ['soundproof']: 220,
      ['bulletproof']: 880,
    },

    tint: {
      ['light']: 55,
      ['medium']: 98,
      ['dark']: 155,
    },
  },
} as const;

export type CarDetails = {
  wheels: {
    rimSize: keyof typeof CarDetailsOptions.wheels.rimSize;
    material: keyof typeof CarDetailsOptions.wheels.material;
  };
  engine: {
    tuning: keyof typeof CarDetailsOptions.engine.tuning;
    fuel: keyof typeof CarDetailsOptions.engine.fuel;
  };
  glass: {
    type: keyof typeof CarDetailsOptions.glass.type;
    tint: keyof typeof CarDetailsOptions.glass.tint;
  };
};

export function calculateWheelsPrice(carDetails: CarDetails): number {
  return (
    4 *
    (CarDetailsOptions.wheels.rimSize[carDetails.wheels.rimSize] +
      CarDetailsOptions.wheels.material[carDetails.wheels.material])
  );
}

export function calculateEnginePrice(carDetails: CarDetails): number {
  return (
    CarDetailsOptions.engine.tuning[carDetails.engine.tuning] +
    CarDetailsOptions.engine.fuel[carDetails.engine.fuel]
  );
}

export function calculateGlassPrice(carDetails: CarDetails): number {
  return (
    CarDetailsOptions.glass.type[carDetails.glass.type] +
    CarDetailsOptions.glass.tint[carDetails.glass.tint]
  );
}

export function calculateCarDetailsPrice(carDetails: CarDetails): number {
  return (
    calculateWheelsPrice(carDetails) +
    calculateEnginePrice(carDetails) +
    calculateGlassPrice(carDetails)
  );
}

export const defaultCarDetails: CarDetails = {
  wheels: {
    rimSize: 18,
    material: 'forged',
  },
  engine: {
    tuning: 'dyno tune',
    fuel: 'hybrid',
  },
  glass: {
    type: 'soundproof',
    tint: 'dark',
  },
};
