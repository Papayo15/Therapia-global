"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

// ─── Types (kept for backward compatibility) ──────────────────────────────────
export interface AnimPhase {
  axis?:     "X" | "Y" | "Z";
  from_deg?: number;
  to_deg?:   number;
  duration:  number;
}

export interface AnimData {
  camera_target:      string;
  camera_offset:      [number, number, number];
  phases:             Record<string, AnimPhase>;
  highlight_on_phase: string;
}

// ─── Segment → animation GLB ──────────────────────────────────────────────────
// Add more entries here as you download animations from Mixamo
const SEG_TO_GLB: Record<string, string> = {
  Hombro:      "/models/ybot-pushup.glb",
  Pecho:       "/models/ybot-pushup.glb",
  Codo:        "/models/ybot-pushup.glb",
  Muñeca:      "/models/ybot-pushup.glb",
  // TODO: add more when downloaded
  // Rodilla:     "/models/ybot-squat.glb",
  // Cadera:      "/models/ybot-squat.glb",
  // Core:        "/models/ybot-crunch.glb",
  // Cervical:    "/models/ybot-neck.glb",
};

function getGlbSrc(segmento?: string, glbRegion?: string | string[]): string {
  if (segmento && SEG_TO_GLB[segmento]) return SEG_TO_GLB[segmento];
  // Infer from glbRegion
  const r = Array.isArray(glbRegion) ? glbRegion[0] : glbRegion ?? "";
  if (r.includes("SHOULDER") || r.includes("ARM") || r.includes("THORAX_ANT")) return "/models/ybot-pushup.glb";
  return "/models/ybot-pushup.glb"; // default until more animations are downloaded
}

// ─── Camera presets per animation ─────────────────────────────────────────────
const CAMERA_PRESETS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  "/models/ybot-pushup.glb": { pos: [2.2, 1.8, 2.2], target: [0, 0.4, 0] },
};

// ─── Animated character ───────────────────────────────────────────────────────
function AnimatedCharacter({
  src,
  accentColor,
}: {
  src:         string;
  accentColor: string;
}) {
  const groupRef              = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(src);
  const { actions }           = useAnimations(animations, groupRef);
  const frameRef              = useRef(0);
  const matRef                = useRef<THREE.MeshStandardMaterial[]>([]);

  // Play first animation
  useEffect(() => {
    const action = Object.values(actions)[0];
    if (!action) return;
    action.reset().fadeIn(0.3).play();
    return () => { action.fadeOut(0.3); };
  }, [actions]);

  // Clone materials once and apply emissive color
  useEffect(() => {
    const mats: THREE.MeshStandardMaterial[] = [];
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.SkinnedMesh) && !(obj instanceof THREE.Mesh)) return;
      const arr = Array.isArray(obj.material) ? obj.material : [obj.material];
      arr.forEach((m, i) => {
        const mat = (m as THREE.MeshStandardMaterial).clone() as THREE.MeshStandardMaterial;
        mat.emissive = new THREE.Color(accentColor);
        mat.emissiveIntensity = 0.1;
        if (Array.isArray(obj.material)) (obj.material as THREE.Material[])[i] = mat;
        else (obj as THREE.Mesh).material = mat;
        mats.push(mat);
      });
    });
    matRef.current = mats;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, accentColor]);

  // Emissive pulse
  useFrame((_, delta) => {
    frameRef.current += delta;
    const pulse = 0.10 + Math.sin(frameRef.current * 1.8) * 0.07;
    for (const m of matRef.current) m.emissiveIntensity = pulse;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.01} />
    </group>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface Nike3DAnimatedViewerProps {
  glbRegion?:   string | string[];
  accentColor?: string;
  anim?:        AnimData;
  className?:   string;
  height?:      string | number;
  segmento?:    string;
}

// ─── Main viewer ──────────────────────────────────────────────────────────────
export function Nike3DAnimatedViewer({
  glbRegion,
  accentColor = "#3b82f6",
  anim:        _anim,
  className,
  height = 320,
  segmento,
}: Nike3DAnimatedViewerProps) {
  const src    = getGlbSrc(segmento, glbRegion);
  const preset = CAMERA_PRESETS[src] ?? { pos: [2.2, 1.8, 2.2], target: [0, 0.8, 0] };

  return (
    <div
      className={className}
      style={{ height, background: "linear-gradient(160deg,#0f1221 0%,#1a1f35 100%)" }}
    >
      <Canvas
        camera={{ position: preset.pos, fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow />
        <directionalLight position={[-4, 4, -2]} intensity={0.4} color="#a0c4ff" />

        <Suspense fallback={null}>
          <AnimatedCharacter src={src} accentColor={accentColor} />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.55}
            scale={3}
            blur={2}
            far={1.5}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          target={preset.target}
          enablePan={false}
          minDistance={1.2}
          maxDistance={6}
          autoRotate
          autoRotateSpeed={1.2}
          enableDamping
          dampingFactor={0.07}
        />
      </Canvas>
    </div>
  );
}

// Preload
useGLTF.preload("/models/ybot-pushup.glb");
