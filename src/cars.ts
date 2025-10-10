import type { Car } from '@/lib/Car';

export const cars: Car[] = [
  {
    name: 'Ferrari 599 GTO',
    price: 700_000,
    model: {
      modelPath: '/models/ferrari_599_gto.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 105,
      offset: [-0.3, 0, 0],
    },
  },
  {
    name: 'Lamborghini Countach LP5000',
    price: 500_000,
    model: {
      modelPath: '/models/lamborghini_countach_lp5000.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 110,
      offset: [-0.3, 0, 0],
    },
  },
  {
    name: 'Lamborghini Aventador Mansory Carbonado',
    price: 600_000,
    model: {
      modelPath: '/models/lamborghini_aventador_mansory_carbonado.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 110,
      offset: [-0.3, 0, 0],
    },
  },
  {
    name: 'Lamborghini Mansory Huracan Torofeo',
    price: 350_000,
    model: {
      modelPath: '/models/lamborghini_mansory_huracan_torofeo.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 110,
      offset: [-0.3, 0, 0],
    },
  },
  {
    name: 'Rolls Royce Ghost',
    price: 357_750,
    model: {
      modelPath: '/models/rolls_royce_ghost.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 2.7,
      offset: [-0.25, 0.71, 0],
    },
  },
  {
    name: 'Lamborghini Aventador LP750',
    price: 500_000,
    model: {
      modelPath: '/models/lamborghini_aventador_lp750.glb',
      wheelNames: [
        'Front_Left_WHeel_wheels004_132',
        'Front_Right_Wheel_wheels_139',
        'Rear_Left_Wheel_wheels006_8',
        'Rear_Right_Wheel_wheels001_3',
      ],
      scale: 0.01,
      offset: [0, 0, 0],
    },
  },
  {
    name: 'Lamborghini Aventador LBWorks',
    price: 550_000,
    model: {
      modelPath: '/models/lamborghini_aventador_lbworks.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 105,
      offset: [-0.3, 0, 0],
    },
  },
  {
    name: 'Ferrari F50 GT',
    price: 1_500_000,
    model: {
      modelPath: '/models/ferrari_f50_gt.glb',
      wheelNames: ['Wheel1A_LF', 'Wheel1A_RF', 'Wheel1A_LR', 'Wheel1A_RR'],
      scale: 1.1,
      offset: [-0.1, 0, 0],
    },
  },
  {
    name: 'Lamborghini Urus SE',
    price: 250_000,
    model: {
      modelPath: '/models/lamborghini_urus_se.glb',
      wheelNames: [
        '3DWheel_Front_L',
        '3DWheel_Front_R',
        '3DWheel_Rear_L',
        '3DWheel_Rear_R',
      ],
      scale: 95,
      offset: [-0.3, 0, 0],
    },
  },
];
