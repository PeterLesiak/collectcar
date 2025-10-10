export type CarModel = {
  modelPath: string;

  wheelNames: string[];

  scale: number;

  offset: [number, number, number];
};

export type Car = {
  name: string;

  price: number;

  model: CarModel;
};
