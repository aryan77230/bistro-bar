// Source: https://reactbits.dev/components/lanyard (TypeScript + Tailwind adaptation)
// Fetched via ReactBits reference and adapted for the Bistro Bar stack:
//   - inlined the original CSS as Tailwind utilities on the wrapper div
//   - typed refs + state so strict TS is happy
//   - the card's base texture is overridden with a bar-interior photo so the
//     hanging card reads as a "bar vibe" instead of the default ReactBits art
//
// Assets live in src/assets/lanyard/ (card.glb, lanyard.png, bar-interior.jpg).
// Vite's assetsInclude: ['**/*.glb'] is set in vite.config.ts.
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../../assets/lanyard/card.glb';
import lanyardBand from '../../assets/lanyard/lanyard.png';
import barInterior from '../../assets/lanyard/bar-interior.jpg';

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative z-0 flex h-full w-full items-center justify-center [animation:lanyard-fade-in_0.45s_ease-out_both]">
      <style>{`
        @keyframes lanyard-fade-in {
          0%   { opacity: 0; }
          40%  { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
  const band = useRef<THREE.Mesh & { geometry: { setPoints: (pts: THREE.Vector3[]) => void } }>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody & { lerped?: THREE.Vector3 }>(null);
  const j2 = useRef<RapierRigidBody & { lerped?: THREE.Vector3 }>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  // GLTF typings from drei are loose; `nodes.card.geometry` and
  // `materials.base/metal` come from the card.glb model's internal structure.
  const { nodes, materials } = useGLTF(cardGLB) as unknown as {
    nodes: {
      card: { geometry: THREE.BufferGeometry };
      clip: { geometry: THREE.BufferGeometry };
      clamp: { geometry: THREE.BufferGeometry };
    };
    materials: {
      base: { map: THREE.Texture };
      metal: THREE.Material;
    };
  };

  // Band texture
  const bandTexture = useTexture(lanyardBand);
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;

  // Our override — the warm bar interior that lives on the card face.
  const barTexture = useTexture(barInterior);
  barTexture.colorSpace = THREE.SRGBColorSpace;
  barTexture.anisotropy = 16;
  barTexture.flipY = false; // GLB UVs usually expect flipY=false

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  // Track last scroll position so we can convert scroll deltas into
  // horizontal impulses on the card — a passive "this thing is alive" hint.
  const lastScrollY = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY : 0
  );
  // Gentle welcome-swing on first mount so the card isn't perfectly still
  // before the user touches it.
  const welcomePushed = useRef<boolean>(false);
  // Real cursor velocity in pixels/second, tracked on the whole window.
  // When the cursor crosses INTO the card mesh we read this and convert it
  // into a one-shot impulse, so slow passes give gentle swings and fast
  // whips give big ones — like a physical hanging object being struck.
  const cursorVel = useRef<{
    vx: number;
    vy: number;
    lastX: number;
    lastY: number;
    lastT: number;
  }>({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = (now - cursorVel.current.lastT) / 1000;
      // Skip the very first event and long gaps (tab switches, etc).
      if (dt > 0 && dt < 0.2 && cursorVel.current.lastT !== 0) {
        cursorVel.current.vx = (e.clientX - cursorVel.current.lastX) / dt;
        cursorVel.current.vy = (e.clientY - cursorVel.current.lastY) / dt;
      }
      cursorVel.current.lastX = e.clientX;
      cursorVel.current.lastY = e.clientY;
      cursorVel.current.lastT = now;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useFrame((state: RootState, delta: number) => {
    // Welcome sway — held off until after the fade-in has finished so the
    // user sees the card land quietly first, then a gentle kick to show it's
    // interactive. (Fade finishes at ~0.45s; we fire at 0.9s.)
    if (!welcomePushed.current && card.current) {
      if (state.clock.elapsedTime > 0.9) {
        card.current.applyImpulse({ x: 0.035, y: 0, z: 0 }, true);
        [j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
        welcomePushed.current = true;
      }
    }

    // (The "cursor crossing the card" impulse is applied from onPointerEnter
    // on the card mesh, not per-frame — so slow passes nudge gently and fast
    // whips swing it hard, rather than the card following the cursor.)

    // Scroll-triggered nudge — magnitude scales with scroll speed,
    // direction flips with scroll direction.
    if (card.current && typeof window !== 'undefined') {
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      if (Math.abs(dy) > 0.5) {
        const force = Math.sign(dy) * Math.min(Math.abs(dy) * 0.0018, 0.03);
        card.current.applyImpulse({ x: force, y: 0, z: 0 }, true);
        [j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      }
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((ref) => {
        const r = ref.current;
        if (!r) return;
        if (!r.lerped) r.lerped = new THREE.Vector3().copy(r.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, r.lerped.distanceTo(r.translation()))
        );
        r.lerped.lerp(r.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped as THREE.Vector3);
      curve.points[2].copy(j1.current.lerped as THREE.Vector3);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel() as unknown as THREE.Vector3);
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        {/* Initial positions match the rope's rest geometry — each joint is
            placed exactly 1 unit below its parent (matching the rope max
            distance of 1) and the card sits 1.5 units below j3 (matching the
            spherical joint's local anchor). Spawning in the resting state
            eliminates the initial "snap into place" glitch on page load. */}
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0, -1, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -2, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -3, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[0, -4.5, 0]}
          ref={card}
          type="dynamic"
          canSleep={false}
          colliders={false}
          // Much lower damping on the card itself so a fast whip produces a
          // real spin that persists for several seconds, instead of being
          // killed by friction after one swing.
          angularDamping={0.6}
          linearDamping={1.2}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerEnter={() => {
              if (!card.current) return;
              // Read the actual pixel/second cursor velocity the instant the
              // cursor crosses into the card. Convert into a lateral impulse +
              // a much stronger rotational torque so fast whips produce real
              // rotation, slow drifts produce a gentle nudge.
              const vx = cursorVel.current.vx;
              const vy = cursorVel.current.vy;
              // Scale is tuned so:
              //   300 px/s (slow drift)  → 0.09 impulse (gentle swing)
              //   1000 px/s (normal)     → 0.30 impulse (clear arc)
              //   2500 px/s (fast whip)  → 0.60 impulse (strong spin)
              //   5000+ px/s (snap)      → 0.80 impulse (capped, full rotation)
              const forceX = Math.sign(vx) * Math.min(Math.abs(vx) * 0.0003, 0.8);
              const forceY = -Math.sign(vy) * Math.min(Math.abs(vy) * 0.00015, 0.25);
              // Torque is MUCH stronger than before — at a fast whip the card
              // should actually rotate, not just tip. Sign of velocity decides
              // which way it spins.
              const torqueZ = -forceX * 3.5;
              card.current.applyImpulse({ x: forceX, y: forceY, z: 0 }, true);
              card.current.applyTorqueImpulse({ x: 0, y: 0, z: torqueZ }, true);
              [j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={barTexture}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.85}
                metalness={0.35}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* meshline registers these intrinsics at runtime via R3F's extend().
            TypeScript can't see them; silence the two JSX tags only. */}
        {/* @ts-expect-error — custom R3F intrinsic from meshline */}
        <meshLineGeometry />
        {/* @ts-expect-error — custom R3F intrinsic from meshline */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

// Preload the GLB so the first render isn't jittery
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(useGLTF as any).preload(cardGLB);
