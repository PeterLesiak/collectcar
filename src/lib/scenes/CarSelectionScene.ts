import {
  ACESFilmicToneMapping,
  Box3,
  BufferGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  FogExp2,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardMaterial,
  MeshStandardNodeMaterial,
  Object3DEventMap,
  PerspectiveCamera,
  PlaneGeometry,
  PostProcessing,
  RectAreaLight,
  RectAreaLightNode,
  Scene,
  Sphere,
  Sprite,
  SpriteNodeMaterial,
  WebGPURenderer,
} from 'three/webgpu';
import {
  color,
  Discard,
  Fn,
  If,
  length,
  mix,
  pass,
  reflector,
  smoothstep,
  uniform,
  uv,
  vec4,
} from 'three/tsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { RectAreaLightTexturesLib } from 'three/examples/jsm/lights/RectAreaLightTexturesLib.js';
import {
  animate,
  AnimationPlaybackControlsWithThen,
  cancelFrame,
  frame,
  type Process,
} from 'motion';

import { createArcStrip, loadEnvironment, loadModel, quadraticCurve } from '../engine';
import type { Car } from '../Car';
import type { Miliseconds, Seconds } from '../types';

export type CarPresentationState = 'default' | 'wheels' | 'engine' | 'glass';

export class CarSelectionScene {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  readonly renderer: WebGPURenderer;

  readonly offscreenCanvas: OffscreenCanvas;

  readonly scene: Scene;
  readonly camera: PerspectiveCamera;

  readonly controls: OrbitControls;
  autoRotateTimestamp: Miliseconds;

  environment: Promise<DataTexture>;

  readonly cars: { data: Car; mesh: Promise<Group<Object3DEventMap>> }[];
  currentIndex: number = 0;

  rotationIndicatorArc: Mesh<BufferGeometry, MeshBasicNodeMaterial> | null = null;
  rotationIndicatorDot: Sprite | null = null;
  rotationIndicatorEnabled: boolean = true;

  readonly postProcessing: PostProcessing;

  readonly frame: Process;

  static async create(
    canvas: HTMLCanvasElement,
    cars: Car[],
  ): Promise<CarSelectionScene> {
    const renderer = new WebGPURenderer({
      canvas: new OffscreenCanvas(window.innerWidth, window.innerHeight),
      antialias: true,
    });

    await renderer.init();

    return new CarSelectionScene(renderer, canvas, cars);
  }

  constructor(renderer: WebGPURenderer, canvas: HTMLCanvasElement, cars: Car[]) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d')!;

    this.renderer = renderer;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.offscreenCanvas = renderer.domElement as unknown as OffscreenCanvas;

    this.scene = new Scene();
    this.scene.fog = new FogExp2(0x000000, 0.3);

    this.camera = new PerspectiveCamera();
    this.camera.position.set(1.3, 4, 2);
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.minPolarAngle = 1.4;
    this.controls.maxPolarAngle = 1.4;
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.autoRotateSpeed = 0.001;
    this.controls.autoRotate = false;
    this.autoRotateTimestamp = performance.now() as Miliseconds;

    RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());

    const directionalLight = new DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 3, 0);
    directionalLight.target.position.set(-3, 0, 0);
    this.scene.add(directionalLight, directionalLight.target);

    const rectAreaLight = new RectAreaLight(0xffffff, 2, 5, 2);
    rectAreaLight.position.set(0, 2, 0);
    rectAreaLight.rotation.set(-Math.PI / 2, 0, 0);
    this.scene.add(rectAreaLight);

    this.environment = loadEnvironment('/environments/voortrekker_interior_1k.exr');
    this.environment.then(environment => {
      environment.mapping = EquirectangularReflectionMapping;
    });

    this.cars = [];
    this.currentIndex = Math.floor(cars.length / 2) + 1;

    cars.forEach((data, index) => {
      const mesh = loadModel(data.model.modelPath);
      mesh.then(mesh => {
        mesh.position.set(...data.model.offset);
        mesh.rotation.set(0, 1.8, 0);
        mesh.scale.setScalar(data.model.scale);

        mesh.traverse(object => {
          if (object instanceof Mesh) {
            const material = object.material as MeshStandardMaterial;

            this.environment.then(environment => {
              material.envMap = environment;
              material.envMapIntensity = 0.7;
            });

            if (material.map) {
              this.renderer.initTexture(material.map);
            }

            if (material.normalMap) {
              this.renderer.initTexture(material.normalMap);
            }
          }
        });

        mesh.visible = this.currentIndex === index;
        this.scene.add(mesh);
      });

      this.cars.push({ data, mesh });
    });

    const car = this.cars[this.currentIndex];
    car.mesh.then(mesh => {
      const baseColor = 0xfb4255;
      const box = new Box3().setFromObject(mesh);
      const sphere = box.getBoundingSphere(new Sphere());
      const radius = sphere.radius * 0.7;
      const center = sphere.center;

      const arcGeometry = createArcStrip(radius, center);

      const arcColor = () => {
        const u = uv().x;

        const diffuse = mix(
          color(baseColor),
          color(0xffffff),
          quadraticCurve(u, 6, 0.5, 0),
        );
        const alpha = quadraticCurve(u, -8, 0.5, 0.5);

        return vec4(diffuse, alpha);
      };

      const arcMaterial = new MeshBasicNodeMaterial({
        colorNode: arcColor(),
        side: DoubleSide,
        transparent: true,
      });

      this.rotationIndicatorArc = new Mesh(arcGeometry, arcMaterial);
      this.rotationIndicatorArc.position.y = 0.001;
      this.rotationIndicatorArc.rotateY(-1.2);
      this.scene.add(this.rotationIndicatorArc);

      const lightness = uniform(0);

      const dotColor = Fn(() => {
        const innerColor = color(baseColor);
        const outerColor = color(0xffffff);
        const innerRadius = 0.02;
        const outerRadius = innerRadius + 0.015;

        const centeredUV = uv().sub(0.5);
        const dist = length(centeredUV);

        If(dist.greaterThan(outerRadius), () => {
          Discard();
        });

        const t = smoothstep(innerRadius, outerRadius, dist);

        return mix(innerColor, outerColor, t).add(lightness);
      });

      this.rotationIndicatorDot = new Sprite(
        new SpriteNodeMaterial({
          colorNode: dotColor(),
          depthTest: false,
          transparent: true,
          opacity: 0.9,
        }),
      );
      this.rotationIndicatorDot.position.set(
        // Math.cos(a) * radius + center.x -> a = 0 => cos(0) = 1
        radius + center.x,
        -0.005,
        // Math.sin(a) * radius + center.z -> a = 0 => sin(0) = 0
        center.z,
      );
      this.rotationIndicatorArc.add(this.rotationIndicatorDot);

      animate(0.9, 1.1, {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
        onUpdate: latest => {
          this.rotationIndicatorDot?.scale.setScalar(latest);
        },
      });
      animate(0.1, 0, {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
        onUpdate: latest => {
          lightness.value = latest;
        },
      });
    });

    this.canvas.addEventListener('pointerdown', () => {
      this.autoRotateTimestamp = performance.now() as Miliseconds;
      this.toggleRotationIndicator(false);
    });

    const reflection = reflector({ resolutionScale: 1, depth: true, bounces: false });
    reflection.target.rotateX(-Math.PI / 2);
    this.scene.add(reflection.target);

    const ground = new Mesh(
      new PlaneGeometry(100, 100),
      new MeshStandardNodeMaterial({
        color: 0x000000,
        emissiveNode: reflection.mul(0.8),
        transparent: true,
        opacity: 0.2,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    this.postProcessing = new PostProcessing(this.renderer);
    const scenePass = pass(this.scene, this.camera);
    const scenePassColor = scenePass.getTextureNode();

    const bloomPass = bloom(scenePassColor, 0.15, 0.5, 0);
    this.postProcessing.outputNode = scenePassColor.add(bloomPass);

    this.frame = frame.update(({ delta }) => this.update(delta as Seconds), true);
  }

  async toggleRotationIndicator(enabled: boolean): Promise<this> {
    if (!this.rotationIndicatorArc || !this.rotationIndicatorDot) return this;

    this.rotationIndicatorEnabled = enabled;

    await animate(
      [this.rotationIndicatorArc.material, this.rotationIndicatorDot.material],
      { opacity: enabled ? 1 : 0 },
      { duration: 0.5 },
    );

    return this;
  }

  get canSwitchBackwards(): boolean {
    return this.currentIndex > 0;
  }

  get canSwitchForward(): boolean {
    return this.currentIndex < this.cars.length - 1;
  }

  async switchCar(direction: 'backward' | 'forward'): Promise<this> {
    if (direction == 'backward' && this.currentIndex <= 0) return this;
    if (direction == 'forward' && this.currentIndex >= this.cars.length - 1) return this;

    this.controls.enabled = false;

    const oldCar = this.cars[this.currentIndex];
    this.currentIndex += direction == 'backward' ? -1 : 1;
    const newCar = this.cars[this.currentIndex];

    const oldCarMesh = await oldCar.mesh;
    const newCarMesh = await newCar.mesh;

    const offset = 10;

    await Promise.all([
      this.toggleRotationIndicator(false),

      animate(0, direction == 'backward' ? offset : -offset, {
        duration: 3,
        ease: [0.666, 0, 0.333, 1],
        onUpdate: latest => {
          oldCarMesh.position.x = oldCar.data.model.offset[0] + latest;
        },
      }),
      animate(direction == 'backward' ? -offset : offset, 0, {
        duration: 3,
        ease: [0.666, 0, 0.333, 1],
        onUpdate: latest => {
          newCarMesh.position.x = newCar.data.model.offset[0] + latest;
          newCarMesh.visible = true;
        },
      }),

      animate(0, 1, {
        duration: 3.1,
        ease: 'circInOut',
        onUpdate: () => {
          oldCarMesh.traverse(object => {
            if (oldCar.data.model.wheelNames.includes(object.name)) {
              object.rotateX(direction == 'backward' ? -0.1 : 0.1);
            }
          });

          newCarMesh.traverse(object => {
            if (newCar.data.model.wheelNames.includes(object.name)) {
              object.rotateX(direction == 'backward' ? -0.1 : 0.1);
            }
          });
        },
      }),

      animate(this.controls.getAzimuthalAngle(), 0.576, {
        duration: 3,
        onUpdate: latest => {
          this.controls.minAzimuthAngle = latest;
          this.controls.maxAzimuthAngle = latest;
        },
      }),
    ]);

    oldCarMesh.visible = false;
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.enabled = true;
    this.autoRotateTimestamp = performance.now() as Miliseconds;

    return this;
  }

  wheelsSpinAnimation: AnimationPlaybackControlsWithThen | null = null;

  async animateCarState(state: CarPresentationState): Promise<this> {
    const animationMap: Record<
      CarPresentationState,
      { azimuthal: number; polar: number; zoom: number; cameraX: number; cameraY: number }
    > = {
      default: { azimuthal: 0.576, polar: 1.4, zoom: 4.65, cameraX: 0, cameraY: 0 },
      wheels: { azimuthal: 0.25, polar: 1.6, zoom: 3, cameraX: -1.8, cameraY: 0.7 },
      engine: { azimuthal: 1.8, polar: 1.5, zoom: 4, cameraX: 0, cameraY: 0.2 },
      glass: { azimuthal: 1.1, polar: 1.4, zoom: 4, cameraX: -1.2, cameraY: 0.5 },
    };
    const animationProps = animationMap[state];

    this.autoRotateTimestamp = Infinity as Miliseconds;
    this.controls.enabled = false;

    if (state == 'wheels') {
      const car = this.cars[this.currentIndex];
      const mesh = await car.mesh;

      this.wheelsSpinAnimation = animate(-Math.PI * 2, Math.PI * 2, {
        duration: 6,
        ease: 'linear',
        repeat: Infinity,
        onUpdate: latest => {
          mesh.traverse(object => {
            if (car.data.model.wheelNames.includes(object.name)) {
              object.rotation.x = latest;
            }
          });
        },
      });
    } else {
      this.wheelsSpinAnimation?.stop();
    }

    await Promise.all([
      animate(this.controls.getAzimuthalAngle(), animationProps.azimuthal, {
        duration: 1,
        ease: [0.666, 0, 0.333, 1],
        onUpdate: latest => {
          this.controls.minAzimuthAngle = latest;
          this.controls.maxAzimuthAngle = latest;
        },
      }),
      animate(this.controls.getPolarAngle(), animationProps.polar, {
        duration: 1,
        ease: [0.666, 0, 0.333, 1],
        onUpdate: latest => {
          this.controls.minPolarAngle = latest;
          this.controls.maxPolarAngle = latest;
        },
      }),
      animate(this.controls.getDistance(), animationProps.zoom, {
        duration: 1,
        ease: [0.666, 0, 0.333, 1],
        onUpdate: latest => {
          this.controls.minDistance = latest;
          this.controls.maxDistance = latest;
        },
      }),
      animate(
        this.controls.target,
        { x: animationProps.cameraX, y: animationProps.cameraY },
        {
          duration: 1,
          ease: [0.666, 0, 0.333, 1],
        },
      ),
    ]);

    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.enabled = true;

    return this;
  }

  update(deltaTime: Seconds): this {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    this.resizeToCanvas(width, height);

    this.controls.autoRotate = performance.now() - this.autoRotateTimestamp > 5000;
    this.controls.autoRotate &&= !this.rotationIndicatorEnabled;
    this.controls.update(deltaTime);

    this.render();

    return this;
  }

  render(): this {
    this.postProcessing.render();

    if (this.renderer._isDeviceLost) return this;
    if (this.offscreenCanvas.width == 0 || this.offscreenCanvas.height == 0) return this;

    this.context.drawImage(this.offscreenCanvas, 0, 0);

    return this;
  }

  #previousWidth: number = NaN;
  #previousHeight: number = NaN;

  resizeToCanvas(width: number, height: number): this {
    if (width === this.#previousWidth && height === this.#previousHeight) return this;

    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer.setSize(width, height, false);
    //this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    return this;
  }

  destroy(): void {
    cancelFrame(this.frame);

    this.renderer.dispose();
  }
}
